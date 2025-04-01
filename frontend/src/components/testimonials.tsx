import Image from "next/image";

import { Marquee } from "@/components/magicui/marquee";
import { cn } from "@/lib/utils";

const reviews = [
    {
        name: "María",
        username: "@mariatechceo",
        body: "Redujimos un 40% nuestros costes operativos gracias a su solución IA.",
        img: "https://i.pravatar.cc/150?img=5", // Mujer
    },
    {
        name: "Carlos",
        username: "@carlosfinanzas",
        body: "Implementación perfecta. Ahora procesamos datos en minutos, no días.",
        img: "https://i.pravatar.cc/150?img=12", // Hombre
    },
    {
        name: "Elena",
        username: "@elenamarketing",
        body: "Incrementamos conversiones un 32% con su sistema de recomendación.",
        img: "https://i.pravatar.cc/150?img=9", // Mujer
    },
    {
        name: "David",
        username: "@davidempresa",
        body: "Automatizamos procesos clave y liberamos tiempo para innovar.",
        img: "https://i.pravatar.cc/150?img=8", // Hombre
    },
    {
        name: "Laura",
        username: "@laurarrhh",
        body: "La mejor inversión tecnológica que hemos hecho en años.",
        img: "https://i.pravatar.cc/150?img=25", // Mujer
    },
    {
        name: "Javier",
        username: "@javilogistica",
        body: "Optimizamos rutas y redujimos emisiones un 28% en 3 meses.",
        img: "https://i.pravatar.cc/150?img=6", // Hombre
    },
    {
        name: "Isabel",
        username: "@isasalud",
        body: "Diagnósticos más precisos y un 35% menos de tiempo en administración.",
        img: "https://i.pravatar.cc/150?img=41", // Mujer
    },
    {
        name: "Alejandro",
        username: "@aleretail",
        body: "Inventario optimizado: redujimos stock en un 22% manteniendo disponibilidad.",
        img: "https://i.pravatar.cc/150?img=4", // Hombre
    },
    {
        name: "Sofía",
        username: "@sofiaeducacion",
        body: "Personalización del aprendizaje: mejoramos resultados académicos un 18%.",
        img: "https://i.pravatar.cc/150?img=13", // Mujer
    },
    {
        name: "Martín",
        username: "@martinconstruccion",
        body: "Predicción de mantenimiento que evitó paradas y ahorró €120K en un año.",
        img: "https://i.pravatar.cc/150?img=14", // Hombre
    },
    {
        name: "Ana",
        username: "@anabanca",
        body: "Reducción del 45% en fraudes gracias a su sistema de detección IA.",
        img: "https://i.pravatar.cc/150?img=29", // Mujer
    },
    {
        name: "Pablo",
        username: "@pabloagricultura",
        body: "Optimización de riego y nutrientes: +15% producción con -30% recursos.",
        img: "https://i.pravatar.cc/150?img=16", // Hombre
    },
    {
        name: "Lucía",
        username: "@luciainmobiliaria",
        body: "Triplicamos leads cualificados con su plataforma de matchmaking IA.",
        img: "https://i.pravatar.cc/150?img=21", // Mujer
    },
    {
        name: "Ricardo",
        username: "@ricardoturismo",
        body: "Personalización que incrementó reservas directas un 26% en seis meses.",
        img: "https://i.pravatar.cc/150?img=10", // Hombre
    },
    {
        name: "Carmen",
        username: "@carmenteleco",
        body: "Automatización del servicio que redujo tiempos de respuesta un 65%.",
        img: "https://i.pravatar.cc/150?img=33", // Mujer
    },
    {
        name: "Miguel",
        username: "@miguelenergia",
        body: "Optimización del consumo energético en tiempo real: ahorro del 23%.",
        img: "https://i.pravatar.cc/150?img=2", // Hombre
    },
    {
        name: "Silvia",
        username: "@silviarrpp",
        body: "Análisis de sentimiento que mejoró nuestra comunicación de crisis un 40%.",
        img: "https://i.pravatar.cc/150?img=17", // Mujer
    },
    {
        name: "Andrés",
        username: "@andreslogistica",
        body: "Reducción del 32% en costes logísticos con planificación inteligente de rutas.",
        img: "https://i.pravatar.cc/150?img=18", // Hombre
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
                "relative h-full w-56 sm:w-60 md:w-64 cursor-pointer overflow-hidden rounded-xl border p-3 mx-2 transition-all duration-300 opacity-90 hover:opacity-100 hover:scale-[1.02]",
                // light styles
                "border-[#C2A57C]/40 bg-gray-950/[.01] hover:bg-gray-950/[.05]",
                // dark styles
                "dark:border-[#C2A57C]/40 dark:bg-gray-50/[.05] dark:hover:bg-gray-50/[.08]",
                // Responsive shadow for better visibility
                "shadow-md shadow-[#C2A57C]/10"
            )}
        >
            <div className="flex flex-row items-center gap-2">
                <Image 
                    className="rounded-full" 
                    width={32} 
                    height={32} 
                    alt={`${name}'s profile`} 
                    src={img} 
                />
                <div className="flex flex-col">
                    <figcaption className="text-sm font-medium text-white">
                        {name}
                    </figcaption>
                    <p className="text-xs font-medium text-[#C2A57C]">{username}</p>
                </div>
            </div>
            <blockquote className="mt-2 text-sm font-medium">{body}</blockquote>
        </figure>
    );
};

export function MarqueeDemo() {
    return (
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden py-4">
            {/* Title para introducir las testimoniales */}
            <div className="text-center mb-4 mt-8 w-full px-4">
                <h2 className="text-2xl md:text-3xl font-bold">Resultados reales</h2>
            </div>

            {/* Container que ocupa todo el ancho */}
            <div className="w-screen relative">
                {/* Primera fila de marquee */}
                <div className="w-full opacity-0 animate-fade-in">
                    <Marquee pauseOnHover className="[--duration:80s] mb-4">
                        {firstRow.map((review) => (
                            <ReviewCard key={review.username} {...review} />
                        ))}
                    </Marquee>
                </div>

                {/* Segunda fila de marquee */}
                <div className="w-full opacity-0 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                    <Marquee reverse pauseOnHover className="[--duration:75s]">
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