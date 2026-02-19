import { Settings, Moon, Bell, Shield, LogOut } from "lucide-react";
import useThemeStore from "../hooks/useThemeStore";
import { useClerk } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const SettingsPage = () => {
    const { theme, setTheme } = useThemeStore();
    const { signOut } = useClerk();

    // Local state for toggles (persisted in localStorage)
    const [pushEnabled, setPushEnabled] = useState(
        localStorage.getItem("pushEnabled") === "true"
    );
    const [emailEnabled, setEmailEnabled] = useState(
        localStorage.getItem("emailEnabled") === "true"
    );
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false); // Mock state

    useEffect(() => {
        const handleSystemThemeChange = (e) => {
            if (theme === "system") {
                document.documentElement.setAttribute("data-theme", e.matches ? "dark" : "light");
            }
        };

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        // Initial apply logic is handled in the store setter, but for mount:
        if (theme === "system") {
            document.documentElement.setAttribute("data-theme", mediaQuery.matches ? "dark" : "light");
        } else {
            document.documentElement.setAttribute("data-theme", theme);
        }

        mediaQuery.addEventListener("change", handleSystemThemeChange);
        return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
    }, [theme]);

    const handlePushToggle = () => {
        const newState = !pushEnabled;
        setPushEnabled(newState);
        localStorage.setItem("pushEnabled", newState);
        toast.success(`Push notifications ${newState ? "enabled" : "disabled"}`);
    };

    const handleEmailToggle = () => {
        const newState = !emailEnabled;
        setEmailEnabled(newState);
        localStorage.setItem("emailEnabled", newState);
        toast.success(`Email digest ${newState ? "enabled" : "disabled"}`);
    };

    const handleTwoFactorToggle = () => {
        setTwoFactorEnabled(!twoFactorEnabled);
        toast.success(`2FA ${!twoFactorEnabled ? "enabled" : "disabled"}`);
    };

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto pb-20">
            <div className="flex items-center gap-3 mb-8">
                <Settings className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold">Settings</h1>
            </div>

            <div className="space-y-6">
                {/* Appearance */}
                <div className="card bg-base-100 shadow-lg border border-base-200">
                    <div className="card-body">
                        <h2 className="card-title text-lg flex items-center gap-2">
                            <Moon size={20} />
                            Appearance
                        </h2>
                        <div className="divider my-0"></div>

                        <div className="flex gap-4 mt-4">
                            <button
                                className={`btn flex-1 ${theme === "light" ? "btn-primary" : "btn-outline border-base-300"}`}
                                onClick={() => setTheme("light")}
                            >
                                Light
                            </button>
                            <button
                                className={`btn flex-1 ${theme === "dark" ? "btn-primary" : "btn-outline border-base-300"}`}
                                onClick={() => setTheme("dark")}
                            >
                                Dark
                            </button>
                            <button
                                className={`btn flex-1 ${theme === "system" ? "btn-primary" : "btn-outline border-base-300"}`}
                                onClick={() => setTheme("system")}
                            >
                                System
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="card bg-base-100 shadow-lg border border-base-200">
                    <div className="card-body">
                        <h2 className="card-title text-lg flex items-center gap-2">
                            <Bell size={20} />
                            Notifications
                        </h2>
                        <div className="divider my-0"></div>
                        <div className="form-control">
                            <label className="label cursor-pointer">
                                <span className="label-text">Push Notifications</span>
                                <input
                                    type="checkbox"
                                    checked={pushEnabled}
                                    onChange={handlePushToggle}
                                    className="toggle toggle-success"
                                />
                            </label>
                        </div>
                        <div className="form-control">
                            <label className="label cursor-pointer">
                                <span className="label-text">Email Digest</span>
                                <input
                                    type="checkbox"
                                    checked={emailEnabled}
                                    onChange={handleEmailToggle}
                                    className="toggle toggle-success"
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Privacy */}
                <div className="card bg-base-100 shadow-lg border border-base-200">
                    <div className="card-body">
                        <h2 className="card-title text-lg flex items-center gap-2">
                            <Shield size={20} />
                            Privacy & Security
                        </h2>
                        <div className="divider my-0"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-base-content/80">Two-Factor Authentication</span>
                            <button
                                className={`btn btn-sm ${twoFactorEnabled ? "btn-success" : "btn-outline"}`}
                                onClick={handleTwoFactorToggle}
                            >
                                {twoFactorEnabled ? "Enabled" : "Enable"}
                            </button>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <span className="text-base-content/80 text-error">Danger Zone</span>
                            <button onClick={() => signOut()} className="btn btn-sm btn-error btn-outline gap-2">
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
