import type {BaseEntity} from "@/features/base/types.ts";

export type Project = BaseEntity & {
    name: string;
};

export type Branch = BaseEntity & {
    name: string;
    project: Project;
};

export type Property = BaseEntity & {
    fileName: string;
    content?: string | null;
    branch: Branch;
};

export type PropertyFile = { id: string; name: string; type: "file"; content: string };
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
