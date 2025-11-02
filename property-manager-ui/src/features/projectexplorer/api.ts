import api from "@/lib/axios";
import type { Project, Branch, Property } from "./types";
import type {ResponseMessage} from "@/features/base/types.ts";

// ---- Project ----
export const fetchProjects = async (): Promise<Project[]> => {
    const { data } = await api.get<Project[]>("/api/project/findAll");
    return data;
};

export const createProject = async (payload: Pick<Project, "name">): Promise<ResponseMessage> => {
    const { data } = await api.post<ResponseMessage>("/api/project/save", payload);
    return data;
};

export const updateProject = async (payload: Project): Promise<ResponseMessage> => {
    const { data } = await api.post<ResponseMessage>("/api/project/update", payload);
    return data;
};

export const deleteProject = async (id: number): Promise<ResponseMessage> => {
    const { data } = await api.post<ResponseMessage>("/api/project/delete", id, {
        headers: { "Content-Type": "application/json" },
    });
    return data;
};

// ---- Branch ----
export const fetchBranches = async (): Promise<Branch[]> => {
    const { data } = await api.get<Branch[]>("/api/branch/findAll");
    return data;
};

export const createBranch = async (payload: Pick<Branch, "name" | "project">): Promise<ResponseMessage> => {
    const { data } = await api.post<ResponseMessage>("/api/branch/save", payload);
    return data;
};

export const updateBranch = async (payload: Branch): Promise<ResponseMessage> => {
    const { data } = await api.post<ResponseMessage>("/api/branch/update", payload);
    return data;
};

export const deleteBranch = async (id: number): Promise<ResponseMessage> => {
    const { data } = await api.post<ResponseMessage>("/api/branch/delete", id, {
        headers: { "Content-Type": "application/json" },
    });
    return data;
};

// ---- Property (files) ----
export const fetchProperties = async (): Promise<Property[]> => {
    const { data } = await api.get<Property[]>("/api/property/findAll");
    return data;
};

export const createProperty = async (payload: Pick<Property, "fileName" | "content" | "branch">): Promise<ResponseMessage> => {
    const { data } = await api.post<ResponseMessage>("/api/property/save", payload);
    return data;
};

export const updateProperty = async (payload: Property): Promise<ResponseMessage> => {
    const { data } = await api.post<ResponseMessage>("/api/property/update", payload);
    return data;
};

export const deleteProperty = async (id: number): Promise<ResponseMessage> => {
    const { data } = await api.post<ResponseMessage>("/api/property/delete", id, {
        headers: { "Content-Type": "application/json" },
    });
    return data;
};
