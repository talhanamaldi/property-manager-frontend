import { useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import type { editor as MonacoEditor } from "monaco-editor";
import { Download, Save, FileType } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface ApiRoutes {
    property: {
        create: string;
        update: (id: number) => string;
    };
}

type FileTypeUnion = "properties" | "yaml" | "env" | "text";

type ToastKind = "success" | "error" | "info";
interface ToastMsg {
    kind: ToastKind;
    text: string;
}

const API: ApiRoutes = {
    property: {
        create: "/api/properties",
        update: (id: number) => `/api/properties/${id}`,
    },
};

const DEFAULT_CONTENT: Record<FileTypeUnion, string> = {
    properties: `app.node=1\napp.cron=0 0/10 * * * *\napp.sendHeartbeat=false\napp.url=https://businessappmanager.ankaref.com\n#app.url=http://127.0.0.1:8992\napp.version=1.0.4\n`,
    yaml: `server:\n  port: 8998\n  compression:\n    enabled: true\n`,
    env: `SPRING_PROFILES_ACTIVE=prod\nJAVA_TOOL_OPTIONS=-Xms512m -Xmx1024m\n`,
    text: `# Notes...\n`,
};

export default function PropertyFilesEditor() {
    const [propertyId, setPropertyId] = useState<number | null>(null);
    const [fileName, setFileName] = useState<string>("application.properties");
    const [content, setContent] = useState<string>(DEFAULT_CONTENT.properties);
    const [busy, setBusy] = useState<boolean>(false);
    const [toast, setToast] = useState<ToastMsg | null>(null);
    const toastTimerRef = useRef<number | null>(null);
    const monacoRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);

    const fileType: FileTypeUnion = useMemo(() => inferType(fileName), [fileName]);
    const monacoLanguage = useMemo(() => mapToMonacoLanguage(fileType), [fileType]);
    const downloadMime = useMemo(() => mapToMime(fileType), [fileType]);

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

    function notify(kind: ToastKind, text: string): void {
        setToast({ kind, text });
        if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = window.setTimeout(() => setToast(null), 4000);
    }

    async function handleSave(): Promise<void> {
        setBusy(true);
        try {
            const payload = {
                fileName,
                content: normalizeNewlines(content ?? ""),
            };
            console.log(payload);
            const isNew = propertyId == null;
            const res = await fetch(isNew ? API.property.create : API.property.update(propertyId), {
                method: isNew ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(`Save failed (${res.status})`);
            const saved: { id?: number } = await res.json();
            if (typeof saved.id === "number") setPropertyId(saved.id);
            notify("success", "Saved");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            notify("error", message);
        } finally {
            setBusy(false);
        }
    }

    function handleDownload(): void {
        const blob = new Blob([content ?? ""], { type: `${downloadMime};charset=utf-8` });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = ensureExtension(fileName, fileType);
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-neutral-50 p-6">
                <div className="mx-auto max-w-6xl space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Property Files Editor</h1>
                            <p className="text-sm text-muted-foreground">Create & manage properties, YAML, and more — with download and save.</p>
                        </div>
                    </div>

                    <Card className="overflow-hidden">
                        <CardHeader className="space-y-3">
                            <CardTitle className="text-base">File</CardTitle>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                <div className="md:col-span-6">
                                    <label className="mb-1 block text-sm">File name</label>
                                    <Input
                                        value={fileName}
                                        onChange={(e) => setFileName(e.target.value)}
                                        placeholder="application.properties"
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="mb-1 block text-sm">Type</label>
                                    <TypeBadge type={fileType} />
                                </div>
                                <div className="md:col-span-3 flex gap-2 md:justify-end">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="outline" onClick={handleDownload} className="gap-2">
                                                <Download className="size-4" /> Download
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Download as a file</TooltipContent>
                                    </Tooltip>
                                    <Button onClick={handleSave} disabled={busy} className="gap-2">
                                        <Save className="size-4" /> {busy ? "Saving…" : "Save"}
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <Separator />
                        <CardContent className="p-0">
                            <Editor
                                height="60vh"
                                language={monacoLanguage}
                                value={content}
                                onChange={(v) => setContent(v ?? "")}
                                onMount={onMount}
                                options={{ automaticLayout: true }}
                            />
                        </CardContent>
                    </Card>

                    {toast && (
                        <div
                            className={`rounded-xl border p-3 text-sm ${
                                toast.kind === "success"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                    : toast.kind === "error"
                                        ? "border-rose-200 bg-rose-50 text-rose-800"
                                        : "border-sky-200 bg-sky-50 text-sky-800"
                            }`}
                        >
                            <pre className="whitespace-pre-wrap">{toast.text}</pre>
                        </div>
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
}

// ---------- helpers ----------
function TypeBadge({ type }: { type: FileTypeUnion }){
    const label =
        type === "properties" ? ".properties" : type === "yaml" ? ".yml / .yaml" : type === "env" ? ".env" : "Plain text";
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
        case "properties":
            return "ini"; // closest to key=value + comments
        case "yaml":
            return "yaml";
        case "env":
            return "shell";
        default:
            return "plaintext";
    }
}

function mapToMime(type: FileTypeUnion): string {
    switch (type) {
        case "yaml":
            return "text/yaml";
        default:
            return "text/plain";
    }
}

function ensureExtension(name: string, type: FileTypeUnion): string {
    if (!name) return nameByType(type);
    const n = String(name).toLowerCase();
    if (type === "properties" && !n.endsWith(".properties")) return name + ".properties";
    if (type === "yaml" && !(n.endsWith(".yml") || n.endsWith(".yaml"))) return name + ".yml";
    if (type === "env" && !(n.endsWith(".env"))) return name + ".env";
    return name;
}

function nameByType(type: FileTypeUnion): string {
    return type === "properties" ? "application.properties" : type === "yaml" ? "application.yml" : type === "env" ? ".env" : "config.txt";
}

function normalizeNewlines(s: string): string {
    return (s || "").replace(/\r\n/g, "\n");
}
