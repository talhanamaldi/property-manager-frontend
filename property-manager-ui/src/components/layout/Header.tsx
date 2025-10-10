import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";

export function Header() {
    const token = useSelector((s: RootState) => s.auth.token);
    return (
        <header className="border-b px-4 py-2 flex items-center justify-between">
            <Link to="/" className="font-semibold">Property Manager</Link>
            <nav className="flex items-center gap-3">
                {token ? (
                    <Link to="/signout" className="underline">Sign out</Link>
                ) : (
                    <Link to="/signin" className="underline">Sign in</Link>
                )}
            </nav>
        </header>
    );
}
