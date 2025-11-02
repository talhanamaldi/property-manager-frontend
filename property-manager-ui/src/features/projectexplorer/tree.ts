import type { Project, Branch, Property, ProjectNode, BranchNode, PropertyFile } from "./types";

export function buildProjectTree(
    projects: Project[],
    branches: Branch[],
    properties: Property[]
): ProjectNode[] {
    // index: projectId -> branches[]
    const branchesByProject = new Map<number, Branch[]>();
    for (const b of branches) {
        const pid = b.project?.id;
        if (pid == null) continue;
        const arr = branchesByProject.get(pid) ?? [];
        arr.push(b);
        branchesByProject.set(pid, arr);
    }

    // index: branchId -> properties[]
    const propsByBranch = new Map<number, Property[]>();
    for (const p of properties) {
        const bid = p.branch?.id;
        if (bid == null) continue;
        const arr = propsByBranch.get(bid) ?? [];
        arr.push(p);
        propsByBranch.set(bid, arr);
    }

    const toFile = (p: Property): PropertyFile => ({
        id: String(p.id),
        name: p.fileName,
        type: "file",
        content: p.content ?? "",
    });

    const toBranchNode = (b: Branch): BranchNode => {
        const props = propsByBranch.get(b.id) ?? [];
        return {
            id: String(b.id),
            name: b.name,
            type: "branch",
            children: props.map(toFile),
        };
    };

    const nodes: ProjectNode[] = projects.map((proj) => ({
        id: String(proj.id),
        name: proj.name,
        type: "project",
        children: (branchesByProject.get(proj.id) ?? []).map(toBranchNode),
    }));

    return nodes;
}
