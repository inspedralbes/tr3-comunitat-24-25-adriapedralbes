import { AvatarCircles } from "@/components/magicui/avatar-circles";

// Usamos los mismos avatares que en el componente original
const avatars = [
    {
        imageUrl: "https://avatars.githubusercontent.com/u/16860528",
        profileUrl: "https://github.com/dillionverma",
    },
    {
        imageUrl: "https://avatars.githubusercontent.com/u/20110627",
        profileUrl: "https://github.com/tomonarifeehan",
    },
    {
        imageUrl: "https://avatars.githubusercontent.com/u/106103625",
        profileUrl: "https://github.com/BankkRoll",
    },
    {
        imageUrl: "https://avatars.githubusercontent.com/u/59228569",
        profileUrl: "https://github.com/safethecode",
    },
    {
        imageUrl: "https://avatars.githubusercontent.com/u/59442788",
        profileUrl: "https://github.com/sanjay-mali",
    },
    {
        imageUrl: "https://avatars.githubusercontent.com/u/89768406",
        profileUrl: "https://github.com/itsarghyadas",
    },
];

export function NewsletterAvatarCircles() {
    return (
        <div className="flex flex-col items-center mb-4">
            <AvatarCircles numPeople={99} avatarUrls={avatars} />
            <p className="text-[#C9A880] font-semibold text-sm mt-2">Únete a 11.236 futuristas</p>
        </div>
    );
}