import { User, Paperclip, Link2, Video, BarChart2, Smile } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export const WritePostComponent: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const componentRef = useRef<HTMLDivElement>(null);

    // Detectar si estamos en vista móvil
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Verificar al inicio
        checkIfMobile();

        // Verificar al cambiar el tamaño de la ventana
        window.addEventListener('resize', checkIfMobile);

        return () => {
            window.removeEventListener('resize', checkIfMobile);
        };
    }, []);

    const handleExpand = () => {
        setIsExpanded(true);
    };

    const handleCancel = () => {
        setIsExpanded(false);
        setPostTitle('');
        setPostContent('');
    };

    // Cierra el componente al hacer clic fuera de él
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (componentRef.current && !componentRef.current.contains(e.target as Node)) {
            // Si hay contenido, confirmar antes de cerrar
            if (postTitle.trim() || postContent.trim()) {
                if (window.confirm("¿Estás seguro de que quieres descartar tu publicación?")) {
                    setIsExpanded(false);
                    setPostTitle('');
                    setPostContent('');
                }
            } else {
                setIsExpanded(false);
            }
        }
    };

    // Manejar el envío del post
    const handleSubmit = () => {
        // Aquí iría la lógica para enviar el post
        console.log("Post enviado:", { title: postTitle, content: postContent });

        // Limpiar el formulario y cerrar
        setPostTitle('');
        setPostContent('');
        setIsExpanded(false);
    };

    // Clases personalizadas para la sombra (solo lados y abajo, no arriba)
    const shadowClasses = "shadow-[0_9px_10px_0_rgba(0,0,0,0.3),_-5px_0_15px_-5px_rgba(0,0,0,0.2),_5px_0_15px_-5px_rgba(0,0,0,0.2)]";

    return (
        <>
            {/* Overlay que cubre todo menos el navbar */}
            {isExpanded && (
                <div
                    className={`fixed inset-0 bg-black/60 z-30 ${isMobile ? 'pt-16' : 'pt-20'}`}
                    onClick={handleOverlayClick}
                />
            )}

            {/* Componente de escritura que se expande naturalmente y desplaza el contenido inferior */}
            <div
                ref={componentRef}
                className={`relative z-40 mb-6 mx-4 sm:mx-2 md:mx-0 ${isExpanded
                    ? `bg-[#323230] rounded-lg border border-white/10 ${shadowClasses}`
                    : `bg-[#323230]/80 rounded-lg p-3 border border-white/10 ${shadowClasses}`}`}
            >
                {!isExpanded ? (
                    // Versión colapsada - solo muestra el avatar y el botón para escribir
                    <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0 self-start">
                            <div className="w-8 h-8 bg-[#444442] rounded-full flex items-center justify-center overflow-hidden border border-white/10">
                                <User className="text-zinc-300" size={18} />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-zinc-900 z-10">
                                1
                            </div>
                        </div>
                        <div className="flex-1">
                            <button
                                onClick={handleExpand}
                                className="w-full text-left text-zinc-300 px-4 py-2 bg-[#444442] rounded-lg hover:bg-[#505050] transition-colors border border-white/5"
                            >
                                Write something
                            </button>
                        </div>
                    </div>
                ) : (
                    // Versión expandida - formulario completo para crear post
                    <div className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="relative flex-shrink-0 self-start">
                                <div className="w-8 h-8 bg-[#444442] rounded-full flex items-center justify-center overflow-hidden border border-white/10">
                                    <User className="text-zinc-300" size={18} />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-zinc-900 z-10">
                                    1
                                </div>
                            </div>
                            <div className="text-sm text-zinc-300">
                                Ad EstMarq posting in <span className="text-white">DevAccelerator</span>
                            </div>
                        </div>

                        {/* Campo de título */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Title"
                                value={postTitle}
                                onChange={(e) => setPostTitle(e.target.value)}
                                className="w-full bg-transparent text-xl font-medium text-white border-none outline-none placeholder-zinc-500"
                                autoFocus
                            />
                        </div>

                        {/* Campo de contenido */}
                        <div className="mb-8">
                            <textarea
                                placeholder="Write something..."
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                className="w-full h-32 bg-transparent text-zinc-200 border-none outline-none resize-none placeholder-zinc-500"
                            />
                        </div>

                        {/* Barra de herramientas */}
                        <div className="flex flex-wrap items-center">
                            <div className="flex flex-wrap space-x-2 mb-2 sm:mb-0">
                                <button className="p-2 text-zinc-300 hover:bg-[#444442] rounded-full transition-colors border border-white/5">
                                    <Paperclip size={20} />
                                </button>
                                <button className="p-2 text-zinc-300 hover:bg-[#444442] rounded-full transition-colors border border-white/5">
                                    <Link2 size={20} />
                                </button>
                                <button className="p-2 text-zinc-300 hover:bg-[#444442] rounded-full transition-colors border border-white/5">
                                    <Video size={20} />
                                </button>
                                <button className="p-2 text-zinc-300 hover:bg-[#444442] rounded-full transition-colors border border-white/5">
                                    <BarChart2 size={20} />
                                </button>
                                <button className="p-2 text-zinc-300 hover:bg-[#444442] rounded-full transition-colors border border-white/5">
                                    <Smile size={20} />
                                </button>
                                <button className="p-2 text-zinc-300 hover:bg-[#444442] rounded-full transition-colors border border-white/5">
                                    <span className="font-bold">GIF</span>
                                </button>
                            </div>

                            <div className="ml-auto flex flex-wrap items-center gap-3 w-full sm:w-auto mt-3 sm:mt-0">
                                <div className="relative">
                                    <button className="px-3 py-1.5 text-zinc-300 bg-[#444442] rounded-lg flex items-center gap-2 text-sm border border-white/5">
                                        Select a category <span className="ml-1">▼</span>
                                    </button>
                                </div>

                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-1.5 text-zinc-300 hover:text-white text-sm font-medium"
                                >
                                    CANCEL
                                </button>

                                <button
                                    onClick={handleSubmit}
                                    className="px-4 py-1.5 bg-[#444442] text-white rounded-lg hover:bg-[#505050] text-sm font-medium border border-white/5"
                                    disabled={!postTitle.trim() && !postContent.trim()}
                                >
                                    POST
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};