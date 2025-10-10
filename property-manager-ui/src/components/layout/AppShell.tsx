import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { Outlet } from "react-router-dom";

export default function AppShell() {
    return (
        <div className="min-h-svh flex flex-col">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
            <Footer />
        </div>
    );
}
