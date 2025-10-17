import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import SignOut from "@/pages/auth/SignOut";
import Dashboard from "@/pages/Dashboard";
import AuthGuard from "@/features/auth/AuthGuard";
import ProjectExplorer from "@/pages/projectexplorer/ProjectExplorer.tsx";

export default function AppRouter() {
    return (
        <Routes>
            <Route element={<AppShell />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route element={<AuthGuard />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path = "/projectExplorer" element={<ProjectExplorer/>}/>
                </Route>
            </Route>

            {/* Public auth routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signout" element={<SignOut />} />

            <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
    );
}
