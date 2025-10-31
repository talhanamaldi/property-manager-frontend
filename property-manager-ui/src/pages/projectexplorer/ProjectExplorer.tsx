import { IconFolderCode } from "@tabler/icons-react"
import { ArrowUpRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"

import React, { useState } from "react";
import { Folder, File, Plus, MoreVertical, ChevronRight, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import PropertyFilesEditor from "@/pages/projectexplorer/PropertyFilesEditor.tsx";


export type PropertyFile = { id: string; name: string; type: "file"; content:string;};
export type BranchNode = {
    id: string;
    name: string;
    type: "branch";
    children: PropertyFile[];
};
export type ProjectNode = {
    id: string;
    name: string;
    type: "project";
    children: BranchNode[];
};



const demoData: ProjectNode[] = [
    {
        id: "project1",
        name: "project1",
        type: "project",
        children: [
            {
                id: "project1-branch1",
                name: "branch1",
                type: "branch",
                children: [
                    { id: "p1-b1-file1", name: "file.properties", type: "file", content:`app.node=1\napp.cron=0 0/10 * * * *\napp.sendHeartbeat=false\napp.url=https://businessappmanager.ankaref.com\n#app.url=http://127.0.0.1:8992\napp.version=1.0.4\n` },
                    { id: "p1-b1-file2", name: "file.yml", type: "file", content:`server:\n  port: 8998\n  compression:\n    enabled: true\n` },
                ],
            },
            {
                id: "project1-branch2",
                name: "branch2",
                type: "branch",
                children: [{ id: "p1-b2-file1", name: "file.properties", type: "file", content:`app.node=1\napp.cron=0 0/10 * * * *\napp.sendHeartbeat=false\napp.url=https://businessappmanager.ankaref.com\n#app.url=http://127.0.0.1:8992\napp.version=1.0.4\n` }],
            },
        ],
    },
    {
        id: "project2",
        name: "project2",
        type: "project",
        children: [
            {
                id: "project2-branch1",
                name: "branch1",
                type: "branch",
                children: [
                    { id: "p2-b1-file1", name: "file.properties", type: "file", content:`app.node=1\napp.cron=0 0/10 * * * *\napp.sendHeartbeat=false\napp.url=https://businessappmanager.ankaref.com\n#app.url=http://127.0.0.1:8992\napp.version=1.0.4\n` },
                    { id: "p2-b1-file2", name: "file.properties", type: "file", content:`app.node=1\napp.cron=0 0/10 * * * *\napp.sendHeartbeat=false\napp.url=https://businessappmanager.ankaref.com\n#app.url=http://127.0.0.1:8992\napp.version=1.0.4\n` },
                ],
            },
            {
                id: "project2-branch2",
                name: "branch2",
                type: "branch",
                children: [{ id: "p2-b2-file1", name: "file.properties", type: "file", content:`app.node=1\napp.cron=0 0/10 * * * *\napp.sendHeartbeat=false\napp.url=https://businessappmanager.ankaref.com\n#app.url=http://127.0.0.1:8992\napp.version=1.0.4\n` }],
            },
        ],
    },
];

function ActionsMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-70 hover:opacity-100" aria-label="Actions">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function TreeRow({
                     depth,
                     isFolder,
                     isOpen,
                     onToggle,
                     icon,
                     name,
                     onAdd,
                     showAdd,
                     onEdit,
                     onDelete,
                     onSelect,
                 }: {
    depth: number;
    isFolder: boolean;
    isOpen?: boolean;
    onToggle?: () => void;
    icon: React.ReactNode;
    name: string;
    onAdd?: () => void;
    showAdd?: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onSelect?: () => void;
}) {
    return (
        <div
            className="group flex h-8 items-center pr-2 text-sm hover:bg-muted/70 rounded-md cursor-default"
            style={{ paddingLeft: depth * 16 + 8 }}
            onDoubleClick={isFolder ? onToggle : onSelect}
            onClick={onSelect}
        >
            {isFolder ? (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle?.();
                    }}
                    className="mr-1 inline-flex h-5 w-5 items-center justify-center rounded hover:bg-muted"
                    aria-label={isOpen ? "Collapse" : "Expand"}
                >
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
            ) : (
                <span className="w-5 mr-1" />
            )}

            <span className="mr-2 text-muted-foreground">{icon}</span>
            <span className="truncate select-none">{name}</span>

            <span className="ml-auto inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {showAdd && (
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                    e.stopPropagation();
                    onAdd?.();
                }}
                aria-label="Add"
                title="Add"
            >
                <Plus className="h-4 w-4" />
            </Button>
        )}
                <ActionsMenu
                    onEdit={() => {
                        onEdit();
                    }}
                    onDelete={() => {
                        onDelete();
                    }}
                />
      </span>
        </div>
    );
}


function FileTree({ data, onSelectFile }: { data: ProjectNode[]; onSelectFile: (file: PropertyFile) => void }) {
    const [openIds, setOpenIds] = useState<Set<string>>(new Set(["project1", "project2"]));

    const toggle = (id: string) =>
        setOpenIds((prev) => {
            const copy = new Set(prev);
            if (copy.has(id)) {
                copy.delete(id);
            } else {
                copy.add(id);
            }
            return copy;
        });

    const isOpen = (id: string) => openIds.has(id);

    return (
        <div className="py-1">
            {data.map((project) => (
                <div key={project.id}>
                    {/* Project Row */}
                    <TreeRow
                        depth={0}
                        isFolder
                        isOpen={isOpen(project.id)}
                        onToggle={() => toggle(project.id)}
                        icon={<Folder className="h-4 w-4" />}
                        name={project.name}
                        showAdd
                        onAdd={() => console.log("Add branch under", project)}
                        onEdit={() => console.log("Edit project", project)}
                        onDelete={() => console.log("Delete project", project)}
                    />

                    {/* Branches */}
                    {isOpen(project.id) && (
                        <div>
                            {project.children.map((branch) => (
                                <div key={branch.id}>
                                    <TreeRow
                                        depth={1}
                                        isFolder
                                        isOpen={isOpen(branch.id)}
                                        onToggle={() => toggle(branch.id)}
                                        icon={<Folder className="h-4 w-4" />}
                                        name={branch.name}
                                        showAdd
                                        onAdd={() => console.log("Add property file under", branch)}
                                        onEdit={() => console.log("Edit branch", branch)}
                                        onDelete={() => console.log("Delete branch", branch)}
                                    />

                                    {/* Files */}
                                    {isOpen(branch.id) && (
                                        <div>
                                            {branch.children.map((file) => (
                                                <div key={file.id}>
                                                    <TreeRow
                                                        depth={2}
                                                        isFolder={false}
                                                        icon={<File className="h-4 w-4" />}
                                                        name={file.name}
                                                        onEdit={() => console.log("Edit file", file)}
                                                        onDelete={() => console.log("Delete file", file)}
                                                        onSelect={() => onSelectFile(file)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <Separator className="my-1" />
                </div>
            ))}
        </div>
    );
}



export default function ProjectExplorer() {
    const [projects] = useState<ProjectNode[]>(demoData);
    const [selectedFile, setSelectedFile] = useState<PropertyFile | null>(null);

    const showEmpty = false;
    return (
        (showEmpty ? (
            <div className="flex items-center justify-center h-full">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <IconFolderCode />
                        </EmptyMedia>
                        <EmptyTitle>No Projects Yet</EmptyTitle>
                        <EmptyDescription>
                            You haven&apos;t created any projects yet. Get started by creating
                            your first project.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <div className="flex gap-2">
                            <Button>Create Project</Button>
                            <Button variant="outline">Import Project</Button>
                        </div>
                    </EmptyContent>
                    <Button
                        variant="link"
                        asChild
                        className="text-muted-foreground"
                        size="sm"
                    >
                        <a href="#">
                            Learn More <ArrowUpRightIcon />
                        </a>
                    </Button>
                </Empty>
            </div>
        ): (
            <div className="flex h-full w-full gap-4 min-h-0">
                {/* Left: File Explorer */}
                <Card className="flex flex-col h-full overflow-hidden gap-2 ">
                    <CardHeader className="px-3 py-2"> {/* <- add px */}
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base pr-4">File Explorer</CardTitle>
                            <Button
                                size="sm"
                                onClick={() => console.log("Add project")}
                                className="gap-1 shrink-0" /* keep it from shrinking */
                                aria-label="Add Project"
                                title="Add Project"
                            >
                                <Plus className="h-4 w-4" />
                                Add Project
                            </Button>
                        </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="p-0 flex-1 min-h-0">
                        <ScrollArea className="h-full px-2 py-2">
                            <FileTree data={projects} onSelectFile={setSelectedFile} />
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Card className="flex-1 overflow-hidden flex flex-col min-h-0">
                  <PropertyFilesEditor selectedFile={selectedFile} />
                </Card>
            </div>
        ))

    )
}