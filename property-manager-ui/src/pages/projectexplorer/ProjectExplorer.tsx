import { IconFolderCode } from "@tabler/icons-react";
import { ArrowUpRightIcon, Folder, File, Plus, MoreVertical, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import PropertyFilesEditor from "@/pages/projectexplorer/PropertyFilesEditor";
import React, { useState } from "react";

import { useProjectExplorerData } from "@/features/projectexplorer/hooks";
import type { ProjectNode, PropertyFile } from "@/features/projectexplorer/types";
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty.tsx";

type ActionsMenuProps = { onEdit: () => void; onDelete: () => void };

function ActionsMenu({ onEdit, onDelete }: ActionsMenuProps) {
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
                <DropdownMenuItem className="text-destructive" onClick={onDelete}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function TreeRow({
                     depth, isFolder, isOpen, onToggle, icon, name, onAdd, showAdd, onEdit, onDelete, onSelect
                 }: {
    depth: number; isFolder: boolean; isOpen?: boolean; onToggle?: () => void; icon: React.ReactNode; name: string;
    onAdd?: () => void; showAdd?: boolean; onEdit: () => void; onDelete: () => void; onSelect?: () => void;
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
                    onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
                    className="mr-1 inline-flex h-5 w-5 items-center justify-center rounded hover:bg-muted"
                    aria-label={isOpen ? "Collapse" : "Expand"}
                >
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
            ) : (<span className="w-5 mr-1" />)}

            <span className="mr-2 text-muted-foreground">{icon}</span>
            <span className="truncate select-none">{name}</span>

            <span className="ml-auto inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {showAdd && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onAdd?.(); }} aria-label="Add" title="Add">
                <Plus className="h-4 w-4" />
            </Button>
        )}
                <ActionsMenu onEdit={onEdit} onDelete={onDelete} />
      </span>
        </div>
    );
}

function FileTree({
                      data, onSelectFile,
                      onAddBranch, onAddProperty, onEditProject, onDeleteProject, onEditBranch, onDeleteBranch, onEditProperty, onDeleteProperty
                  }: {
    data: ProjectNode[];
    onSelectFile: (file: PropertyFile) => void;
    onAddBranch: (projectId: string) => void;
    onAddProperty: (branchId: string) => void;
    onEditProject: (projectId: string) => void;
    onDeleteProject: (projectId: string) => void;
    onEditBranch: (branchId: string) => void;
    onDeleteBranch: (branchId: string) => void;
    onEditProperty: (fileId: string) => void;
    onDeleteProperty: (fileId: string) => void;
}) {
    const [openIds, setOpenIds] = useState<Set<string>>(new Set());
    const toggle = (id: string) => setOpenIds((prev) => {
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
                    <TreeRow
                        depth={0}
                        isFolder
                        isOpen={isOpen(project.id)}
                        onToggle={() => toggle(project.id)}
                        icon={<Folder className="h-4 w-4" />}
                        name={project.name}
                        showAdd
                        onAdd={() => onAddBranch(project.id)}
                        onEdit={() => onEditProject(project.id)}
                        onDelete={() => onDeleteProject(project.id)}
                    />
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
                                        onAdd={() => onAddProperty(branch.id)}
                                        onEdit={() => onEditBranch(branch.id)}
                                        onDelete={() => onDeleteBranch(branch.id)}
                                    />
                                    {isOpen(branch.id) && (
                                        <div>
                                            {branch.children.map((file) => (
                                                <div key={file.id}>
                                                    <TreeRow
                                                        depth={2}
                                                        isFolder={false}
                                                        icon={<File className="h-4 w-4" />}
                                                        name={file.name}
                                                        onEdit={() => onEditProperty(file.id)}
                                                        onDelete={() => onDeleteProperty(file.id)}
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
    const {
        tree, isLoading, isError, error,
        createProjectM, deleteProjectM, updateProjectM,
        createBranchM, deleteBranchM, updateBranchM,
        createPropertyM, deletePropertyM,
    } = useProjectExplorerData();

    const [selectedFile, setSelectedFile] = useState<PropertyFile | null>(null);

    // Action handlers (replace with dialogs/forms as desired)
    const handleAddProject = () => {
        const name = prompt("Project name?");
        if (!name) return;
        createProjectM.mutate({ name });
    };

    const handleAddBranch = (projectId: string) => {
        const name = prompt("Branch name?");
        if (!name) return;

        createBranchM.mutate({ name, project: { id: Number(projectId) } as any });
    };

    const handleAddProperty = (branchId: string) => {
        const fileName = prompt("File name? (e.g., application.yml)");
        if (!fileName) return;
        createPropertyM.mutate({
            fileName,
            content: "",
            branch: { id: Number(branchId), name: "", project: { id: 0, name: "" } } as any,
        });
    };

    const handleEditProject = (projectId: string) => {
        const name = prompt("New project name?");
        if (!name) return;
        updateProjectM.mutate({ id: Number(projectId), name } as any);
    };

    const handleDeleteProject = (projectId: string) => {
        if (!confirm("Delete project?")) return;
        deleteProjectM.mutate(Number(projectId));
    };

    const handleEditBranch = (branchId: string) => {
        const name = prompt("New branch name?");
        if (!name) return;
        updateBranchM.mutate({ id: Number(branchId), name, project: { id: 0, name: "" } } as any);
    };

    const handleDeleteBranch = (branchId: string) => {
        if (!confirm("Delete branch?")) return;
        deleteBranchM.mutate(Number(branchId));
    };

    const handleEditProperty = (fileId: string) => {
        // Open editor side; your editor already handles content changes. Name changes could be added here.
        const file = findPropertyFile(tree, fileId);
        if (file) setSelectedFile(file);
    };

    const handleDeleteProperty = (fileId: string) => {
        if (!confirm("Delete file?")) return;
        deletePropertyM.mutate(Number(fileId));
        if (selectedFile?.id === fileId) setSelectedFile(null);
    };

    const showEmpty = false;

    if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Loading project tree…</div>;
    if (isError)   return <div className="p-4 text-sm text-red-600">Failed to load: {String((error as any)?.message ?? error)}</div>;

    return (
        showEmpty ? (
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
        ) : (
            <div className="flex h-full w-full gap-4 min-h-0">
                {/* Left: File Explorer */}
                <Card className="flex flex-col h-full overflow-hidden gap-2">
                    <CardHeader className="px-3 py-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base pr-4">File Explorer</CardTitle>
                            <Button size="sm" onClick={handleAddProject} className="gap-1 shrink-0" aria-label="Add Project" title="Add Project">
                                <Plus className="h-4 w-4" />
                                Add Project
                            </Button>
                        </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="p-0 flex-1 min-h-0">
                        <ScrollArea className="h-full px-2 py-2">
                            <FileTree
                                data={tree}
                                onSelectFile={setSelectedFile}
                                onAddBranch={handleAddBranch}
                                onAddProperty={handleAddProperty}
                                onEditProject={handleEditProject}
                                onDeleteProject={handleDeleteProject}
                                onEditBranch={handleEditBranch}
                                onDeleteBranch={handleDeleteBranch}
                                onEditProperty={handleEditProperty}
                                onDeleteProperty={handleDeleteProperty}
                            />
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Card className="flex-1 overflow-hidden flex flex-col min-h-0">
                    <PropertyFilesEditor selectedFile={selectedFile} />
                </Card>
            </div>
        )
    );
}

// helper to find a PropertyFile in current tree
function findPropertyFile(tree: ProjectNode[], fileId: string): PropertyFile | null {
    for (const p of tree) {
        for (const b of p.children) {
            const hit = b.children.find((f) => f.id === fileId);
            if (hit) return hit;
        }
    }
    return null;
}
