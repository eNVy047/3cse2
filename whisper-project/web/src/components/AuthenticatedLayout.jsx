import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router";

const AuthenticatedLayout = () => {
    const { isSignedIn, isLoaded } = useAuth();

    if (isLoaded && !isSignedIn) {
        return <Navigate to="/" />;
    }

    return (
        <div className="flex h-screen bg-base-100 text-base-content overflow-hidden font-sans">
            <Sidebar />
            <main className="flex-1 overflow-auto w-full relative">
                <Outlet />
            </main>
        </div>
    );
};

export default AuthenticatedLayout;
