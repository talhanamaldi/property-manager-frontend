import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchProjects, fetchBranches, fetchProperties,
    createProject, updateProject, deleteProject,
    createBranch, updateBranch, deleteBranch,
    createProperty, updateProperty, deleteProperty
} from "./api";
import { buildProjectTree } from "./tree";
import type { ProjectNode } from "./types";

const QK = {
    projects: ["projects"] as const,
    branches: ["branches"] as const,
    properties: ["properties"] as const,
};

export function useProjectExplorerData() {
    const qc = useQueryClient();

    const projectsQ = useQuery({ queryKey: QK.projects, queryFn: fetchProjects });
    const branchesQ = useQuery({ queryKey: QK.branches, queryFn: fetchBranches });
    const propertiesQ = useQuery({ queryKey: QK.properties, queryFn: fetchProperties });

    const isLoading = projectsQ.isLoading || branchesQ.isLoading || propertiesQ.isLoading;
    const isError = projectsQ.isError || branchesQ.isError || propertiesQ.isError;
    const error = projectsQ.error || branchesQ.error || propertiesQ.error;

    let tree: ProjectNode[] = [];
    if (projectsQ.data && branchesQ.data && propertiesQ.data) {
        tree = buildProjectTree(projectsQ.data, branchesQ.data, propertiesQ.data);
    }

    // --- mutations (invalidate on success) ---
    const makeInvalidateAll = () => () => {
        qc.invalidateQueries({ queryKey: QK.projects });
        qc.invalidateQueries({ queryKey: QK.branches });
        qc.invalidateQueries({ queryKey: QK.properties });
    };

    const createProjectM = useMutation({ mutationFn: createProject, onSuccess: makeInvalidateAll() });
    const updateProjectM = useMutation({ mutationFn: updateProject, onSuccess: makeInvalidateAll() });
    const deleteProjectM = useMutation({ mutationFn: deleteProject, onSuccess: makeInvalidateAll() });

    const createBranchM = useMutation({ mutationFn: createBranch, onSuccess: makeInvalidateAll() });
    const updateBranchM = useMutation({ mutationFn: updateBranch, onSuccess: makeInvalidateAll() });
    const deleteBranchM = useMutation({ mutationFn: deleteBranch, onSuccess: makeInvalidateAll() });

    const createPropertyM = useMutation({ mutationFn: createProperty, onSuccess: makeInvalidateAll() });
    const updatePropertyM = useMutation({ mutationFn: updateProperty, onSuccess: makeInvalidateAll() });
    const deletePropertyM = useMutation({ mutationFn: deleteProperty, onSuccess: makeInvalidateAll() });

    return {
        tree, isLoading, isError, error,
        // raw lists too (sometimes handy):
        projects: projectsQ.data, branches: branchesQ.data, properties: propertiesQ.data,
        // mutations:
        createProjectM, updateProjectM, deleteProjectM,
        createBranchM, updateBranchM, deleteBranchM,
        createPropertyM, updatePropertyM, deletePropertyM,
    };
}
