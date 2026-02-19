import { Routes, Route, Navigate } from "react-router";
import { useAuth } from "@clerk/clerk-react";
import { Toaster } from "react-hot-toast";

import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import FeedPage from "./pages/FeedPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import SearchPage from "./pages/SearchPage"; // Added import
import UserProfilePage from "./pages/UserProfilePage";

import AuthenticatedLayout from "./components/AuthenticatedLayout";
import PageLoader from "./components/PageLoader";
import useUserSync from "./hooks/useUserSync";

function App() {
  const { isLoaded, isSignedIn } = useAuth();
  useUserSync();

  if (!isLoaded) return <PageLoader />;

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={!isSignedIn ? <HomePage /> : <Navigate to={"/feed"} />} />

        {/* Authenticated Routes with Sidebar */}
        <Route element={<AuthenticatedLayout />}>
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/search" element={<SearchPage />} /> {/* Added route */}
          <Route path="/profile/:id" element={<UserProfilePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
