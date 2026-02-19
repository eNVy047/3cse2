import { useAuth, UserButton } from "@clerk/clerk-react";
import { MessageSquare, Settings, User, SquareActivity, LogOut, Search } from "lucide-react";
import { NavLink, useLocation } from "react-router";

const Sidebar = () => {
    const { signOut } = useAuth();
    const location = useLocation();

    const navItems = [
        { icon: SquareActivity, label: "Feed", path: "/" },
        { icon: Search, label: "Search", path: "/search" },
        { icon: MessageSquare, label: "Chat", path: "/chat" },
        { icon: User, label: "Profile", path: "/profile" },
        { icon: Settings, label: "Settings", path: "/settings" },
    ];

    return (
        <aside className="h-screen w-20 bg-base-200 border-r border-base-300 flex flex-col items-center py-4 sticky top-0 bg-opacity-80 backdrop-blur-lg">
            <div className="mb-8">
                {/* Logo or Brand Icon */}
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                    <span className="font-bold text-white text-lg">W</span>
                </div>
            </div>

            <nav className="flex-1 flex flex-col gap-4 w-full px-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === "/" || item.path === "/profile"}
                        className={({ isActive }) => {
                            // Custom logic: Highlighting Search when viewing other user's profile (/profile/:id)
                            const isSearchActive = item.label === "Search" && (isActive || location.pathname.startsWith("/profile/"));
                            // For other items, use standard isActive.
                            // However, we forced 'end' on Profile, so it won't match /profile/123
                            const finalIsActive = item.label === "Search" ? isSearchActive : isActive;

                            return `p-3 rounded-xl flex items-center justify-center transition-all duration-200 group relative
              ${finalIsActive
                                    ? "bg-primary text-primary-content shadow-md scale-105"
                                    : "text-base-content/60 hover:bg-base-300 hover:text-base-content"
                                }`
                        }}
                    >
                        <item.icon className="w-6 h-6" />
                        <span className="absolute left-16 bg-base-300 text-base-content px-2 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-sm">
                            {item.label}
                        </span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto flex flex-col gap-4 items-center w-full px-2">
                <div className="mb-2">
                    <UserButton />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
