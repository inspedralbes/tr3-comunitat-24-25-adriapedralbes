import { AvatarCircles } from "@/components/magicui/avatar-circles";

const avatars = [
    {
        imageUrl: "https://randomuser.me/api/portraits/women/44.jpg",
        profileUrl: "#",
    },
    {
        imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
        profileUrl: "#",
    },
    {
        imageUrl: "https://randomuser.me/api/portraits/women/68.jpg",
        profileUrl: "#",
    },
    {
        imageUrl: "https://randomuser.me/api/portraits/men/75.jpg",
        profileUrl: "#",
    },
    {
        imageUrl: "https://randomuser.me/api/portraits/women/89.jpg",
        profileUrl: "#",
    },
    {
        imageUrl: "https://randomuser.me/api/portraits/men/26.jpg",
        profileUrl: "#",
    },
];

export function AvatarCirclesDemo() {
    return <AvatarCircles numPeople={99} avatarUrls={avatars} />;
}