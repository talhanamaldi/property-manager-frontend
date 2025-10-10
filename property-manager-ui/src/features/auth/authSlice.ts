import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type AuthState = { token: string | null; expiresAt: string | null };
const initialState: AuthState = {
    token: localStorage.getItem("auth_token"),
    expiresAt: localStorage.getItem("auth_expiresAt"),
};

const slice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<AuthState>) => {
            state.token = action.payload.token;
            state.expiresAt = action.payload.expiresAt;
            localStorage.setItem("auth_token", action.payload.token ?? "");
            localStorage.setItem("auth_expiresAt", action.payload.expiresAt ?? "");
        },
        logout: (state) => {
            state.token = null;
            state.expiresAt = null;
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_expiresAt");
        },
    },
});

export const { setCredentials, logout } = slice.actions;
export default slice.reducer;
