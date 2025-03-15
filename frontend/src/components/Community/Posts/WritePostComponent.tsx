    // Función para obtener el color del badge según el nivel
    const getBadgeColor = (level: number) => {
        const colors: Record<number, string> = {
            1: 'bg-gray-500',
            2: 'bg-green-500',
            3: 'bg-blue-500',
            4: 'bg-indigo-500',
            5: 'bg-purple-500',
            6: 'bg-pink-500',
            7: 'bg-red-500',
            8: 'bg-yellow-500',
            9: 'bg-amber-500',
            10: 'bg-orange-500',
        };
        return colors[level] || 'bg-blue-500';
    };

    // Determinar si el texto debe ser negro (para fondos claros)
    const getTextColor = (level: number) => {
        return level === 8 || level === 9 ? 'text-black' : 'text-white';
    };import { User, Paperclip, Link2, Video, BarChart2, Smile } from 'lucide-react';
import Image from 'next/image';
import React, { useState, useRef, useEffect } from 'react';

import { AuthModal, AuthModalType } from '@/components/Auth';
import { authService } from '@/services/auth';

interface Category {
    id: number;
    name: string;
    slug: string;
    color: string;
}

interface WritePostComponentProps {
    onSubmit?: (content: string, title?: string, categoryId?: number) => Promise<boolean>;
    categories?: Category[];
}

export const WritePostComponent: React.FC<WritePostComponentProps> = ({
    onSubmit,
    categories = []
}) => {
    // Función para obtener el color del badge según el nivel
    const getBadgeColor = (level: number) => {
        const colors: Record<number, string> = {
            1: 'bg-gray-500',
            2: 'bg-green-500',
            3: 'bg-blue-500',
            4: 'bg-indigo-500',
            5: 'bg-purple-500',
            6: 'bg-pink-500',
            7: 'bg-red-500',
            8: 'bg-yellow-500',
            9: 'bg-amber-500',
            10: 'bg-orange-500',
        };
        return colors[level] || 'bg-blue-500';
    };

    // Determinar si el texto debe ser negro (para fondos claros)
    const getTextColor = (level: number) => {
        return level === 8 || level === 9 ? 'text-black' : 'text-white';
    };

    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [error, setError] = useState('');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [user, setUser] = useState<{
        avatar_url?: string;
        username?: string;
        level?: number;
    } | null>(null);

    const componentRef = useRef<HTMLDivElement>(null);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);

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

    // Obtener información del usuario si está autenticado
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                if (authService.isAuthenticated()) {
                    const userProfile = await authService.getProfile();
                    setUser(userProfile);
                }
            } catch (error) {
                console.error('Error al obtener perfil de usuario:', error);
            }
        };

        fetchUserProfile();
    }, [isAuthModalOpen]); // Refetch cuando el modal se cierra

    // Cerrar dropdown de categorías al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                showCategoryDropdown &&
                categoryDropdownRef.current &&
                !categoryDropdownRef.current.contains(event.target as Node)
            ) {
                setShowCategoryDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCategoryDropdown]);

    const handleExpand = () => {
        // Verificar si el usuario está autenticado
        if (!authService.isAuthenticated()) {
            setIsAuthModalOpen(true);
            return;
        }

        setIsExpanded(true);
    };

    const handleAuthSuccess = () => {
        setIsAuthModalOpen(false);
        // Refrescar info de usuario y expandir el editor
        setIsExpanded(true);
    };

    const handleCancel = () => {
        setIsExpanded(false);
        setPostTitle('');
        setPostContent('');
        setSelectedCategory(undefined);
        setError('');
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
                    setSelectedCategory(undefined);
                    setError('');
                }
            } else {
                setIsExpanded(false);
            }
        }
    };

    // Manejador de teclado para el overlay
    const handleOverlayKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            // Si hay contenido, confirmar antes de cerrar
            if (postTitle.trim() || postContent.trim()) {
                if (window.confirm("¿Estás seguro de que quieres descartar tu publicación?")) {
                    setIsExpanded(false);
                    setPostTitle('');
                    setPostContent('');
                    setSelectedCategory(undefined);
                    setError('');
                }
            } else {
                setIsExpanded(false);
            }
        }
    };

    // Maneja el cambio de categoría
    const handleCategoryChange = (categoryId: number) => {
        setSelectedCategory(categoryId);
        setShowCategoryDropdown(false);
    };

    // Manejar el envío del post
    const handleSubmit = async () => {
        if (!postContent.trim()) {
            setError('El contenido del post no puede estar vacío');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            if (onSubmit) {
                // Si hay título, enviarlo; de lo contrario, usar el contenido como título también
                const title = postTitle.trim() || postContent.split('\n')[0]; // Usar la primera línea como título si no hay título
                const success = await onSubmit(postContent, title, selectedCategory);

                if (success) {
                    // Limpiar el formulario y cerrar
                    setPostTitle('');
                    setPostContent('');
                    setSelectedCategory(undefined);
                    setIsExpanded(false);
                } else {
                    setError('Hubo un error al publicar tu mensaje. Inténtalo de nuevo.');
                }
            }
        } catch (err) {
            console.error('Error al enviar post:', err);
            setError('Hubo un error al publicar tu mensaje. Inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Encontrar la categoría seleccionada
    const selectedCategoryName = selectedCategory
        ? categories.find(cat => cat.id === selectedCategory)?.name || 'Categoría'
        : 'Selecciona una categoría';

    // Clases personalizadas para la sombra (solo lados y abajo, no arriba)
    const shadowClasses = "shadow-[0_9px_10px_0_rgba(0,0,0,0.3),_-5px_0_15px_-5px_rgba(0,0,0,0.2),_5px_0_15px_-5px_rgba(0,0,0,0.2)]";

    // Manejador de eventos de teclado para el elemento clicable
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleExpand();
        }
    };

    return (
        <>
            {/* Modal de autenticación */}
            <AuthModal
                isOpen={isAuthModalOpen}
                type={AuthModalType.LOGIN}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={handleAuthSuccess}
            />

            {/* Overlay que cubre todo menos el navbar */}
            {isExpanded && (
                <button
                    aria-label="Cerrar editor de publicación"
                    className={`fixed inset-0 bg-black/60 z-30 ${isMobile ? 'pt-16' : 'pt-20'} w-full h-full cursor-default`}
                    onClick={handleOverlayClick}
                    onKeyDown={handleOverlayKeyDown}
                    tabIndex={0}
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
                                {user?.avatar_url ? (
                                    <Image
                                        src={user.avatar_url}
                                        alt={user.username || 'User'}
                                        width={32}
                                        height={32}
                                        className="w-full h-full object-cover"
                                        unoptimized={user.avatar_url.includes('127.0.0.1') || user.avatar_url.includes('localhost')}
                                    />
                                ) : (
                                    <User className="text-zinc-300" size={18} />
                                )}
                            </div>
                            {user?.level && (
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getBadgeColor(user.level)} rounded-full flex items-center justify-center text-[10px] font-bold ${getTextColor(user.level)} border border-zinc-900 z-10`}>
                                    {user.level}
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div
                                onClick={handleExpand}
                                onKeyDown={handleKeyDown}
                                tabIndex={0}
                                role="button"
                                aria-label="Escribir nuevo post"
                                className="w-full text-left text-zinc-300 px-4 py-2 bg-[#444442] rounded-lg hover:bg-[#505050] transition-colors border border-white/5 cursor-pointer"
                            >
                                Escribe algo...
                            </div>
                        </div>
                    </div>
                ) : (
                    // Versión expandida - formulario completo para crear post
                    <div className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="relative flex-shrink-0 self-start">
                                <div className="w-8 h-8 bg-[#444442] rounded-full flex items-center justify-center overflow-hidden border border-white/10">
                                    {user?.avatar_url ? (
                                        <Image
                                            src={user.avatar_url}
                                            alt={user.username || 'User'}
                                            width={32}
                                            height={32}
                                            className="w-full h-full object-cover"
                                            unoptimized={user.avatar_url.includes('127.0.0.1') || user.avatar_url.includes('localhost')}
                                        />
                                    ) : (
                                        <User className="text-zinc-300" size={18} />
                                    )}
                                </div>
                                {user?.level && (
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getBadgeColor(user.level)} rounded-full flex items-center justify-center text-[10px] font-bold ${getTextColor(user.level)} border border-zinc-900 z-10`}>
                                        {user.level}
                                    </div>
                                )}
                            </div>
                            <div className="text-sm text-zinc-300">
                                {user?.username || 'Usuario'} publicando en <span className="text-white">FuturPrive</span>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="mb-4 p-2 bg-red-500/20 text-red-300 text-sm rounded border border-red-500/30">
                                {error}
                            </div>
                        )}

                        {/* Campo de título */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Título (opcional)"
                                value={postTitle}
                                onChange={(e) => setPostTitle(e.target.value)}
                                className="w-full bg-transparent text-xl font-medium text-white border-none outline-none placeholder-zinc-500"
                            />
                        </div>

                        {/* Campo de contenido */}
                        <div className="mb-8">
                            <textarea
                                placeholder="Escribe algo..."
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
                                <div className="relative" ref={categoryDropdownRef}>
                                    <button
                                        className="px-3 py-1.5 text-zinc-300 bg-[#444442] rounded-lg flex items-center gap-2 text-sm border border-white/5"
                                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                    >
                                        {selectedCategoryName} <span className="ml-1">▼</span>
                                    </button>

                                    {showCategoryDropdown && categories.length > 0 && (
                                        <div className="absolute top-full left-0 mt-1 bg-[#323230] rounded-lg shadow-lg z-10 py-1 min-w-[180px] border border-white/10">
                                            {categories.map((category) => (
                                                <button
                                                    key={category.id}
                                                    className={`flex items-center gap-2 px-4 py-2 w-full text-left text-sm
                                                        ${selectedCategory === category.id
                                                            ? 'bg-[#444442] text-white'
                                                            : 'text-zinc-300 hover:bg-[#444442]'
                                                        }`}
                                                    onClick={() => handleCategoryChange(category.id)}
                                                >
                                                    {category.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-1.5 text-zinc-300 hover:text-white text-sm font-medium"
                                >
                                    CANCELAR
                                </button>

                                <button
                                    onClick={handleSubmit}
                                    className={`px-4 py-1.5 ${isSubmitting ? 'bg-blue-600/50' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg text-sm font-medium border border-white/5 transition-colors`}
                                    disabled={!postContent.trim() || isSubmitting}
                                >
                                    {isSubmitting ? 'PUBLICANDO...' : 'PUBLICAR'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};