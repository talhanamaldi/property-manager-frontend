import api from "@/lib/axios";
import type { User, AuthResponse } from "./types";

export const signin = async (payload: Pick<User, "email" | "password">): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/api/auth/signin", payload);
    return data;
};

export const signup = async (payload: User): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/api/auth/signup", payload);
    return data;
};
