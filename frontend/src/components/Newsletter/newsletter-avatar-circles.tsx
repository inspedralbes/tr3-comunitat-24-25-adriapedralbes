import { AvatarCircles } from "@/components/magicui/avatar-circles";

// Usamos avatares diferentes para tener más variedad
const avatars = [
    {
        imageUrl: "https://randomuser.me/api/portraits/women/33.jpg",
        profileUrl: "#",
    },
    {
        imageUrl: "https://randomuser.me/api/portraits/men/54.jpg",
        profileUrl: "#",
    },
    {
        imageUrl: "https://randomuser.me/api/portraits/women/29.jpg",
        profileUrl: "#",
    },
    {
        imageUrl: "https://randomuser.me/api/portraits/men/42.jpg",
        profileUrl: "#",
    },
    {
        imageUrl: "https://randomuser.me/api/portraits/women/77.jpg",
        profileUrl: "#",
    },
    {
        imageUrl: "https://randomuser.me/api/portraits/men/12.jpg",
        profileUrl: "#",
    },
];

export function NewsletterAvatarCircles() {
    return (
        <div className="flex flex-col items-center mb-4">
            <AvatarCircles numPeople={99} avatarUrls={avatars} />
            <p className="text-[#C9A880] font-semibold text-sm mt-2">Únete a +7.200 futuristas</p>
        </div>
    );
}