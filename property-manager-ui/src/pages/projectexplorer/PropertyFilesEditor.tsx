import React, {useEffect, useMemo, useRef, useState} from "react";
import Editor from "@monaco-editor/react";
import type {editor as MonacoEditor} from "monaco-editor";
import {Download, Save, FileType} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Tooltip, TooltipContent, TooltipTrigger, TooltipProvider} from "@/components/ui/tooltip";
import {Separator} from "@/components/ui/separator";
import {Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription} from "@/components/ui/empty";
import {IconFileCode} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProperty } from "@/features/projectexplorer/api";
import type { PropertyFile } from "@/features/projectexplorer/types";

type FileTypeUnion = "properties" | "yaml" | "env" | "text";

export default function PropertyFilesEditor({ selectedFile }: { selectedFile: PropertyFile | null }) {
    const [fileName, setFileName] = useState<string | null>(null);
    const [content, setContent] = useState<string>("");

    const monacoRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
    const fileType: FileTypeUnion = useMemo(() => inferType(fileName), [fileName]);
    const monacoLanguage = useMemo(() => mapToMonacoLanguage(fileType), [fileType]);
    const downloadMime = useMemo(() => mapToMime(fileType), [fileType]);

    const qc = useQueryClient();
    const { mutate: saveMutate, isPending: isSaving } = useMutation({
        mutationFn: async () => {
            if (!selectedFile) return;
            // update by id; keep fileName/content. If your backend requires branch: include it.
            return updateProperty({ id: Number(selectedFile.id), fileName: fileName ?? selectedFile.name, content, branch: { id: 0, name: "", project: { id: 0, name: "" } } as any });
        },
        onSuccess: () => {
            // Refresh properties to reflect the new content in the tree (if you display it anywhere)
            qc.invalidateQueries({ queryKey: ["properties"] });
        },
    });

    useEffect(() => {
        setFileName(selectedFile ? selectedFile.name : null);
        setContent(selectedFile ? (selectedFile.content ?? "") : "");
    }, [selectedFile]);

    function onMount(editor: MonacoEditor.IStandaloneCodeEditor): void {
        monacoRef.current = editor;
        editor.updateOptions({
            wordWrap: "on",
            minimap: { enabled: false },
            lineNumbers: "on",
            tabSize: 2,
            fontSize: 14,
            cursorBlinking: "smooth",
            padding: { top: 12 },
            renderWhitespace: "selection",
            scrollBeyondLastLine: false,
        });
    }

    function handleDownload(): void {
        const blob = new Blob([content ?? ""], { type: `${downloadMime};charset=utf-8` });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = ensureExtension(fileName ?? "", fileType);
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    return (
        <TooltipProvider>
            <div className="h-full p-4 overflow-hidden">
                <div className="h-full space-y-4 flex flex-col">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Property Files Editor</h1>
                            <p className="text-sm text-muted-foreground">Create & manage properties, YAML, and more — with download and save.</p>
                        </div>
                    </div>

                    {selectedFile === null ? (
                        <div className="flex items-center justify-center h-full">
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon"><IconFileCode /></EmptyMedia>
                                    <EmptyTitle>No File Selected</EmptyTitle>
                                    <EmptyDescription>Select a file from the tree to view its content.</EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        </div>
                    ) : (
                        <Card className="overflow-hidden flex-1 flex flex-col min-h-0">
                            <CardHeader className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                    <div className="md:col-span-4">
                                        <label className="mb-1 block text-base">File name</label>
                                        <p className="text-sm px-3 py-2 border rounded-md bg-muted/30">{fileName}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="mb-1 block text-sm">Type</label>
                                        <TypeBadge type={fileType} />
                                    </div>
                                    <div className="md:col-span-6 flex gap-2 md:justify-end">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="outline" onClick={handleDownload} className="gap-2">
                                                    <Download className="size-4" /> Download
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Download as a file</TooltipContent>
                                        </Tooltip>
                                        <Button onClick={() => saveMutate()} className="gap-2" disabled={isSaving}>
                                            <Save className="size-4" />
                                            {isSaving ? "Saving…" : "Save"}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <Separator />
                            <CardContent className="p-0 flex-1 min-h-0">
                                <div className="h-full">
                                    <Editor
                                        height="100%"
                                        language={monacoLanguage}
                                        value={content}
                                        onChange={(v) => setContent(v ?? "")}
                                        onMount={onMount}
                                        options={{ automaticLayout: true }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
}

// --- helpers (unchanged except small null guards) ---

function TypeBadge({ type }: { type: FileTypeUnion }) {
    const label = type === "properties" ? ".properties" : type === "yaml" ? ".yml / .yaml" : type === "env" ? ".env" : "Plain text";
    const intent: "default" | "secondary" | "outline" | "destructive" =
        type === "properties" ? "default" : type === "yaml" ? "secondary" : type === "env" ? "outline" : "destructive";
    return (
        <Badge variant={intent} className="inline-flex items-center gap-1">
            <FileType className="size-3" /> {label}
        </Badge>
    );
}

function inferType(name: string | null | undefined): FileTypeUnion {
    if (!name) return "text";
    const n = String(name).toLowerCase();
    if (n.endsWith(".properties")) return "properties";
    if (n.endsWith(".yml") || n.endsWith(".yaml")) return "yaml";
    if (n === ".env" || n.endsWith(".env")) return "env";
    return "text";
}

function mapToMonacoLanguage(type: FileTypeUnion): string {
    switch (type) {
        case "properties": return "ini";
        case "yaml": return "yaml";
        case "env": return "shell";
        default: return "plaintext";
    }
}

function mapToMime(type: FileTypeUnion): string {
    switch (type) {
        case "yaml": return "text/yaml";
        default: return "text/plain";
    }
}

function ensureExtension(name: string, type: FileTypeUnion): string {
    if (!name) return nameByType(type);
    const n = String(name).toLowerCase();
    if (type === "properties" && !n.endsWith(".properties")) return name + ".properties";
    if (type === "yaml" && !(n.endsWith(".yml") || n.endsWith(".yaml"))) return name + ".yml";
    if (type === "env" && !n.endsWith(".env")) return name + ".env";
    return name;
}

function nameByType(type: FileTypeUnion): string {
    return type === "properties" ? "application.properties"
        : type === "yaml" ? "application.yml"
            : type === "env" ? ".env"
                : "config.txt";
}
