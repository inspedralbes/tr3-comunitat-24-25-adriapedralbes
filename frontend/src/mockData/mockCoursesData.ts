import { Course } from '@/components/Classroom/CourseGrid';
import { CourseWithLessons, Lesson } from '@/types/Lesson';

// Datos de lecciones para el primer curso
const communityCourseLessons: Lesson[] = [
    {
        id: "que-es-devaccelerator",
        title: "¿Qué es DevAccelerator™?",
        content: {
            heading: "¿Qué es DevAccelerator™?",
            subheading: "Cómo unirte a DevAccelerator™",
            imageUrl: "/api/placeholder/600/400",
            paragraphs: [
                "Mantenemos nuestra membresía cerrada a un máximo de 2 spots por mes para que la experiencia de nuestros miembros sea premium.",
                "Solemos abrir plazas a nuestro programa normalmente la última semana de cada mes.",
                "Por favor, presta atención a las redes + emails de Patri, y si quieres recibir acceso anticipado, asegúrate de unirte a la lista de espera aquí abajo para que te avisemos antes que a nadie más.👇"
            ],
            callToAction: {
                text: "ÚNETE A LA WAITLIST 👇",
                url: "https://devaccelerator.io/lista-de-espera"
            }
        },
        isCompleted: true
    },
    {
        id: "que-hace-diferente",
        title: "¿Qué hace a DevAccelerator™ diferente?",
        content: {
            heading: "¿Qué hace a DevAccelerator™ diferente?",
            paragraphs: [
                "DevAccelerator™ no es un bootcamp ni un curso tradicional. Es un programa de aceleración para desarrolladores que quieren llevar su carrera al siguiente nivel.",
                "Nos centramos en el aprendizaje práctico y personalizado, con mentores que te guían en cada paso del camino.",
                "Nuestro enfoque único combina formación técnica avanzada con habilidades blandas esenciales para destacar en el mercado laboral actual."
            ]
        },
        isCompleted: false
    },
    {
        id: "gamified-learning",
        title: "¿Qué es \"Gamified Learning\"?",
        content: {
            heading: "¿Qué es \"Gamified Learning\"?",
            paragraphs: [
                "El aprendizaje gamificado integra elementos de juegos en el proceso educativo para hacerlo más atractivo y efectivo.",
                "En DevAccelerator™, utilizamos un sistema de puntos, niveles y logros que te motivan a seguir aprendiendo y mejorando constantemente.",
                "Este enfoque ha demostrado aumentar la retención de conocimientos en un 40% y la participación de los estudiantes en un 60%."
            ]
        },
        isCompleted: false
    },
    {
        id: "unete-waitlist",
        title: "Únete a nuestra waitlist - DevAcc.™",
        content: {
            heading: "Únete a nuestra waitlist",
            paragraphs: [
                "Las plazas para DevAccelerator™ son limitadas y se agotan rápidamente.",
                "Al unirte a nuestra lista de espera, recibirás notificación prioritaria cuando abramos nuevas plazas.",
                "También tendrás acceso a contenido exclusivo y descuentos especiales para futuros programas."
            ],
            callToAction: {
                text: "REGISTRARME AHORA",
                url: "https://devaccelerator.io/lista-de-espera"
            }
        },
        isCompleted: false
    }
];

// Datos mock de cursos basados en la imagen de referencia con lecciones incluidas
export const mockCoursesWithLessons: CourseWithLessons[] = [
    {
        id: 1,
        title: "Comunidad DevAccelerator™",
        description: "¡Te doy la bienvenida oficial a la comunidad DevAccelerator™!",
        imageUrl: "/api/placeholder/600/400",
        progress: 25,
        isPrivate: false,
        lessons: communityCourseLessons
    },
    // Añadir lecciones a los demás cursos según sea necesario
];

// Datos mock de cursos (versión simple para la vista de cuadrícula)
export const mockCourses: Course[] = [
    {
        id: 1,
        title: "Comunidad DevAccelerator™",
        description: "¡Te doy la bienvenida oficial a la comunidad DevAccelerator™!",
        imageUrl: "/api/placeholder/600/400",
        progress: 25,
        isPrivate: false
    },
    {
        id: 2,
        title: "Modelo DevAccelerator™",
        description: "Este es un Mini Curso de 6 partes mostrándote exactamente cómo conseguir...",
        imageUrl: "/api/placeholder/600/400",
        progress: 0,
        isPrivate: false
    },
    {
        id: 3,
        title: "The LinkedIn Blueprint™",
        description: "¡Obtén un perfil competitivo y comienza a recibir tus ofertas soñadas! Deja de gastar...",
        imageUrl: "/api/placeholder/600/400",
        progress: 0,
        isPrivate: false
    },
    {
        id: 4,
        title: "English Lessons (Materials)",
        description: "",
        imageUrl: "/api/placeholder/600/400",
        progress: 0,
        isPrivate: true
    },
    {
        id: 5,
        title: "Masterclasses",
        description: "",
        imageUrl: "/api/placeholder/600/400",
        progress: 0,
        isPrivate: true
    },
    {
        id: 6,
        title: "DevAcc. TM - Nivel 0 - Empieza aquí",
        description: "",
        imageUrl: "/api/placeholder/600/400",
        progress: 0,
        isPrivate: true
    },
];