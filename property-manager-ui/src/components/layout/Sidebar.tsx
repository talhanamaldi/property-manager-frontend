import { NavLink } from "react-router-dom";

export function Sidebar() {
    return (
        <aside className="w-40 border-r p-4">
            <nav className="space-y-2">
                <NavLink to="/dashboard" className="block">Dashboard</NavLink>
            </nav>
        </aside>
    );
}
