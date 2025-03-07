import { cn } from "@/lib/utils";
import { Marquee } from "@/components/magicui/marquee";

const reviews = [
    {
        name: "Jack",
        username: "@jack",
        body: "I've never seen anything like this before. It's amazing. I love it.",
        img: "https://avatar.vercel.sh/jack",
    },
    {
        name: "Jill",
        username: "@jill",
        body: "I don't know what to say. I'm speechless. This is amazing.",
        img: "https://avatar.vercel.sh/jill",
    },
    {
        name: "John",
        username: "@john",
        body: "I'm at a loss for words. This is amazing. I love it.",
        img: "https://avatar.vercel.sh/john",
    },
    {
        name: "Jane",
        username: "@jane",
        body: "I'm at a loss for words. This is amazing. I love it.",
        img: "https://avatar.vercel.sh/jane",
    },
    {
        name: "Jenny",
        username: "@jenny",
        body: "I'm at a loss for words. This is amazing. I love it.",
        img: "https://avatar.vercel.sh/jenny",
    },
    {
        name: "James",
        username: "@james",
        body: "I'm at a loss for words. This is amazing. I love it.",
        img: "https://avatar.vercel.sh/james",
    },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
    img,
    name,
    username,
    body,
}: {
    img: string;
    name: string;
    username: string;
    body: string;
}) => {
    return (
        <figure
            className={cn(
                "relative h-full w-56 sm:w-64 md:w-72 cursor-pointer overflow-hidden rounded-xl border p-4 mx-2 transition-all duration-300 opacity-90 hover:opacity-100 hover:scale-[1.02]",
                // light styles
                "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
                // dark styles
                "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
                // Responsive shadow for better visibility
                "shadow-md dark:shadow-gray-950/30"
            )}
        >
            <div className="flex flex-row items-center gap-2">
                <img className="rounded-full" width="32" height="32" alt="" src={img} />
                <div className="flex flex-col">
                    <figcaption className="text-sm font-medium dark:text-white">
                        {name}
                    </figcaption>
                    <p className="text-xs font-medium dark:text-white/40">{username}</p>
                </div>
            </div>
            <blockquote className="mt-2 text-sm">{body}</blockquote>
        </figure>
    );
};

export function MarqueeDemo() {
    return (
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden py-8">
            {/* Title para introducir las testimoniales */}
            <div className="text-center mb-8 w-full px-4">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Lo que dicen nuestros clientes</h2>
                <p className="text-gray-400">Descubre por qué nuestras soluciones marcan la diferencia</p>
            </div>

            {/* Container que ocupa todo el ancho */}
            <div className="w-screen relative">
                {/* Primera fila de marquee */}
                <div className="w-full opacity-0 animate-fade-in">
                    <Marquee pauseOnHover className="[--duration:30s] mb-4">
                        {firstRow.map((review) => (
                            <ReviewCard key={review.username} {...review} />
                        ))}
                    </Marquee>
                </div>

                {/* Segunda fila de marquee */}
                <div className="w-full opacity-0 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                    <Marquee reverse pauseOnHover className="[--duration:30s]">
                        {secondRow.map((review) => (
                            <ReviewCard key={review.username} {...review} />
                        ))}
                    </Marquee>
                </div>

                {/* Gradientes en los bordes con mayor tamaño y transparencia gradual */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 lg:w-1/5 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent z-10"></div>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 lg:w-1/5 bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent z-10"></div>
            </div>
        </div>
    );
}