import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { RootState } from "@/app/store";

export default function AuthGuard() {
    const token = useSelector((s: RootState) => s.auth.token);
    const loc = useLocation();
    if (!token) return <Navigate to="/signin" replace state={{ from: loc }} />;
    return <Outlet />;
}
