import { Calendar, FileText, Heart } from "lucide-react";

const ActivityBar = ({ stats, joinedAt }) => {
    if (!stats) return null;

    const items = [
        {
            icon: FileText,
            label: "Posts",
            value: stats.postsCount || 0,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            icon: Heart,
            label: "Likes Received",
            value: stats.likesReceived || 0,
            color: "text-red-500",
            bg: "bg-red-500/10",
        },
        {
            icon: Calendar,
            label: "Joined",
            value: new Date(joinedAt).toLocaleDateString(),
            color: "text-green-500",
            bg: "bg-green-500/10",
        },
    ];

    return (
        <div className="flex flex-wrap gap-4 w-full">
            {items.map((item, index) => (
                <div key={index} className="flex-1 min-w-[140px] bg-base-100 border border-base-200 p-4 rounded-xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className={`p-3 rounded-full ${item.bg} ${item.color}`}>
                        <item.icon size={20} />
                    </div>
                    <div>
                        <p className="text-xl font-bold">{item.value}</p>
                        <p className="text-xs text-base-content/60 uppercase font-medium">{item.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActivityBar;
