import { create } from "zustand";

const useThemeStore = create((set) => ({
    theme: localStorage.getItem("theme") || "system",
    setTheme: (theme) => {
        localStorage.setItem("theme", theme);
        set({ theme });

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            document.documentElement.setAttribute("data-theme", systemTheme);
        } else {
            document.documentElement.setAttribute("data-theme", theme);
        }
    },
}));

export default useThemeStore;
