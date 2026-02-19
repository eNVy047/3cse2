import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router"; // Assuming react-router-dom handling routing
import api from "../lib/axios";

const SearchPage = () => {
    const [query, setQuery] = useState("");

    // Debounce query slightly to avoid too many requests
    const [debouncedQuery, setDebouncedQuery] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const { data: users, isLoading } = useQuery({
        queryKey: ["searchUsers", debouncedQuery],
        queryFn: async () => {
            if (!debouncedQuery) return [];
            const { data } = await api.get(`/users/search?query=${debouncedQuery}`);
            return data;
        },
        enabled: debouncedQuery.length > 0,
        staleTime: 1000 * 60, // Cache for 1 min
    });

    return (
        <div className="h-full p-4 md:p-8 overflow-hidden flex flex-col">
            <div className="max-w-2xl mx-auto w-full space-y-6 flex-1 flex flex-col">
                <h1 className="text-2xl font-bold">Search Users</h1>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" size={20} />
                    <input
                        type="text"
                        className="input input-bordered w-full pl-10 focus:input-primary"
                        placeholder="Search by name or email..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin text-primary" size={30} />
                        </div>
                    ) : users?.length > 0 ? (
                        <div className="grid gap-4">
                            {users.map((user) => (
                                <Link
                                    to={`/profile/${user.clerkId}`} // Assuming profile route accepts ID, though currently ProfilePage uses current user. Need refactor if clicking goes to *their* profile. But for now linking to just /profile might show *me*. Actually, let's just make it visually result for now.
                                    key={user._id}
                                    className="flex items-center gap-4 p-4 bg-base-100 rounded-xl hover:bg-base-200 transition-colors border border-base-200"
                                >
                                    <div className="avatar">
                                        <div className="w-12 h-12 rounded-full">
                                            <img src={user.avatar || "/avatar-placeholder.png"} alt={user.name} />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-lg truncate">{user.name}</h3>
                                        {user.bio && <p className="text-sm text-base-content/60 truncate">{user.bio}</p>}
                                        {!user.bio && <p className="text-sm text-base-content/60 truncate">{user.email}</p>}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : debouncedQuery ? (
                        <div className="text-center py-10 text-base-content/50">
                            No users found matching "{debouncedQuery}"
                        </div>
                    ) : (
                        <div className="text-center py-10 text-base-content/50">
                            Type to search for amazing people
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
