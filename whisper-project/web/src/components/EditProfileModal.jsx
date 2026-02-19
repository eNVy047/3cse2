import { useState, useRef } from "react";
import { X, Camera, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import api from "../lib/axios";

const EditProfileModal = ({ isOpen, onClose, currentUser }) => {
    const [name, setName] = useState(currentUser?.name || "");
    const [bio, setBio] = useState(currentUser?.bio || "");
    const [avatar, setAvatar] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(currentUser?.avatar || "");

    const fileInputRef = useRef(null);
    const queryClient = useQueryClient();
    const { user: clerkUser } = useUser();

    // State updates logic moved or removed if not needed, seeing as hooks must run unconditionally.
    // The conditional return will be moved to before the render.

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const updateProfileMutation = useMutation({
        mutationFn: async (formData) => {
            const { data } = await api.put("/users/update", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return data;
        },
        onSuccess: (updatedUser) => {
            toast.success("Profile updated successfully");
            queryClient.invalidateQueries({ queryKey: ["currentUser"] });

            // Optionally update Clerk user metadata/image if needed, 
            // but for now we rely on our backend as source of truth for app data.
            // If we want to sync avatar back to clerk:
            // clerkUser?.setProfileImage({ file: avatar }); 

            onClose();
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || "Failed to update profile");
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", name);
        formData.append("bio", bio);
        if (avatar) {
            formData.append("avatar", avatar);
        }

        updateProfileMutation.mutate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-base-100 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b border-base-200">
                    <h2 className="text-lg font-bold">Edit Profile</h2>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex justify-center">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="avatar">
                                <div className="w-24 h-24 rounded-full border-4 border-base-200 ring transition-all group-hover:ring-primary ring-offset-2 ring-offset-base-100 overflow-hidden">
                                    <img src={previewUrl || "/avatar-placeholder.png"} alt="Avatar" className="object-cover" />
                                </div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white" size={24} />
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Name</span>
                        </label>
                        <input
                            type="text"
                            className="input input-bordered w-full focus:input-primary"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name"
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Bio</span>
                        </label>
                        <textarea
                            className="textarea textarea-bordered w-full h-24 resize-none focus:textarea-primary"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                        ></textarea>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" className="btn flex-1" onClick={onClose}>Cancel</button>
                        <button
                            type="submit"
                            className="btn btn-primary flex-1"
                            disabled={updateProfileMutation.isPending}
                        >
                            {updateProfileMutation.isPending ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
