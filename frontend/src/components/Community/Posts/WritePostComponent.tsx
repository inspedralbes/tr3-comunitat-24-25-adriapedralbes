import { User, Paperclip, Link2, Video, BarChart2, Smile, X } from 'lucide-react';
import Image from 'next/image';
import React, { useState, useRef, useEffect } from 'react';

import { AuthModal, AuthModalType } from '@/components/Auth';
import UserLevelBadge from '@/components/ui/UserLevelBadge';
import { authService } from '@/services/auth';

interface Category {
    id: number;
    name: string;
    slug: string;
    color: string;
}

interface PollOption {
    text: string;
    id: number;
}

interface WritePostComponentProps {
    onSubmit?: (
        content: string, 
        title?: string, 
        categoryId?: number, 
        attachments?: File[], 
        videoUrl?: string, 
        linkUrl?: string,
        pollOptions?: PollOption[]
    ) => Promise<boolean>;
    categories?: Category[];
}

export const WritePostComponent: React.FC<WritePostComponentProps> = ({
    onSubmit,
    categories = []
}) => {
    // Estas funciones ya no son necesarias, se utilizará el componente UserLevelBadge

    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [error, setError] = useState('');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    
    // Estados para las nuevas funcionalidades
    const [attachments, setAttachments] = useState<File[]>([]);
    const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');
    const [showVideoInput, setShowVideoInput] = useState(false);
    const [pollOptions, setPollOptions] = useState<PollOption[]>([{ id: 1, text: '' }, { id: 2, text: '' }]);
    const [showPollCreator, setShowPollCreator] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const [user, setUser] = useState<{
        avatar_url?: string | null;
        username?: string;
        level?: number;
    } | null>(null);

    const componentRef = useRef<HTMLDivElement>(null);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

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

    // Cerrar otros popups al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Cerrar emoji picker si está abierto y el clic fue fuera
            if (
                showEmojiPicker &&
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(event.target as Node)
            ) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);

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
        // Limpiar estados de las nuevas funcionalidades
        setAttachments([]);
        setLinkUrl('');
        setVideoUrl('');
        setPollOptions([{ id: 1, text: '' }, { id: 2, text: '' }]);
        setShowAttachmentPreview(false);
        setShowLinkInput(false);
        setShowVideoInput(false);
        setShowPollCreator(false);
        setShowEmojiPicker(false);
    };

    // Cierra el componente al hacer clic fuera de él
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (componentRef.current && !componentRef.current.contains(e.target as Node)) {
            // Si hay contenido, confirmar antes de cerrar
            if (postTitle.trim() || postContent.trim() || attachments.length > 0 || linkUrl || videoUrl || 
                pollOptions.some(option => option.text.trim())) {
                if (window.confirm("¿Estás seguro de que quieres descartar tu publicación?")) {
                    setIsExpanded(false);
                    setPostTitle('');
                    setPostContent('');
                    setSelectedCategory(undefined);
                    setError('');
                    // Limpiar estados de las nuevas funcionalidades
                    setAttachments([]);
                    setLinkUrl('');
                    setVideoUrl('');
                    setPollOptions([{ id: 1, text: '' }, { id: 2, text: '' }]);
                    setShowAttachmentPreview(false);
                    setShowLinkInput(false);
                    setShowVideoInput(false);
                    setShowPollCreator(false);
                    setShowEmojiPicker(false);
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
            if (postTitle.trim() || postContent.trim() || attachments.length > 0 || linkUrl || videoUrl || 
                pollOptions.some(option => option.text.trim())) {
                if (window.confirm("¿Estás seguro de que quieres descartar tu publicación?")) {
                    setIsExpanded(false);
                    setPostTitle('');
                    setPostContent('');
                    setSelectedCategory(undefined);
                    setError('');
                    // Limpiar estados de las nuevas funcionalidades
                    setAttachments([]);
                    setLinkUrl('');
                    setVideoUrl('');
                    setPollOptions([{ id: 1, text: '' }, { id: 2, text: '' }]);
                    setShowAttachmentPreview(false);
                    setShowLinkInput(false);
                    setShowVideoInput(false);
                    setShowPollCreator(false);
                    setShowEmojiPicker(false);
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

    // Handler para el botón de adjuntar archivo
    const handleAttachFile = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Handler para cuando se seleccionan archivos
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            // Convertir FileList a array
            const newFiles = Array.from(files);
            
            // Verificar que los archivos sean imágenes o documentos aceptados
            let validFiles = newFiles.filter(file => 
                file.type.startsWith('image/') || 
                file.type === 'application/pdf' ||
                file.type === 'application/msword' ||
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                file.type === 'text/plain'
            );
            
            if (validFiles.length !== newFiles.length) {
                alert('Algunos archivos no son soportados. Solo se permiten imágenes, PDF y documentos de texto.');
            }
            
            // Contar cuántas imágenes ya tenemos y cuántas nuevas hay
            const currentImages = attachments.filter(file => file.type.startsWith('image/')).length;
            const newImages = validFiles.filter(file => file.type.startsWith('image/')).length;
            
            // Verificar el límite de 3 imágenes
            if (currentImages + newImages > 3) {
                alert('Solo se permiten un máximo de 3 imágenes por publicación.');
                
                // Filtrar para no exceder el límite
                const remainingImageSlots = Math.max(0, 3 - currentImages);
                
                // Separar imágenes de otros archivos
                const newImageFiles = validFiles.filter(file => file.type.startsWith('image/')).slice(0, remainingImageSlots);
                const newNonImageFiles = validFiles.filter(file => !file.type.startsWith('image/'));
                
                // Combinar respetando el límite
                validFiles = [...newImageFiles, ...newNonImageFiles];
            }
            
            if (validFiles.length > 0) {
                setAttachments([...attachments, ...validFiles]);
                setShowAttachmentPreview(true);
            }
        }
    };

    // Handler para eliminar un archivo adjunto
    const handleRemoveAttachment = (index: number) => {
        const newAttachments = [...attachments];
        newAttachments.splice(index, 1);
        setAttachments(newAttachments);
        if (newAttachments.length === 0) {
            setShowAttachmentPreview(false);
        }
    };

    // Handler para el botón de enlace
    const handleLinkButton = () => {
        setShowLinkInput(!showLinkInput);
        setShowVideoInput(false);
        setShowPollCreator(false);
        setShowEmojiPicker(false);
    };

    // Handler para el botón de video
    const handleVideoButton = () => {
        setShowVideoInput(!showVideoInput);
        setShowLinkInput(false);
        setShowPollCreator(false);
        setShowEmojiPicker(false);
    };

    // Handler para el botón de encuesta
    const handlePollButton = () => {
        setShowPollCreator(!showPollCreator);
        setShowLinkInput(false);
        setShowVideoInput(false);
        setShowEmojiPicker(false);
    };

    // Handler para añadir una opción a la encuesta
    const handleAddPollOption = () => {
        // Generar un nuevo ID para la opción
        const newId = Math.max(...pollOptions.map(option => option.id), 0) + 1;
        setPollOptions([...pollOptions, { id: newId, text: '' }]);
    };

    // Handler para eliminar una opción de la encuesta
    const handleRemovePollOption = (id: number) => {
        // No permitir menos de 2 opciones
        if (pollOptions.length <= 2) return;
        setPollOptions(pollOptions.filter(option => option.id !== id));
    };

    // Handler para cambiar el texto de una opción de encuesta
    const handlePollOptionChange = (id: number, text: string) => {
        setPollOptions(pollOptions.map(option => 
            option.id === id ? { ...option, text } : option
        ));
    };

    // Handler para el botón de emoji
    const handleEmojiButton = () => {
        setShowEmojiPicker(!showEmojiPicker);
        setShowLinkInput(false);
        setShowVideoInput(false);
        setShowPollCreator(false);
    };

    // Array de emojis comunes
    const commonEmojis = [
        "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", 
        "😉", "😊", "😇", "🥰", "😍", "😘", "😗", "😚", "😙", "😋", 
        "😛", "😜", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨",
        "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔",
        "😪", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶",
        "👍", "👎", "👏", "🙌", "🤝", "👊", "✌️", "🤞", "🤟", "🤘",
        "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "❣️", "💕", "💞"
    ];

    // Handler para añadir emoji al contenido
    const handleEmojiSelect = (emoji: string) => {
        setPostContent(prevContent => prevContent + emoji);
        setShowEmojiPicker(false);
    };

    // Manejar el envío del post
    const handleSubmit = async () => {
        if (!postContent.trim()) {
            setError('El contenido del post no puede estar vacío');
            return;
        }

        // Validar la encuesta si está activa
        if (showPollCreator) {
            // Al menos dos opciones deben tener texto
            const validOptions = pollOptions.filter(option => option.text.trim().length > 0);
            if (validOptions.length < 2) {
                setError('Una encuesta debe tener al menos dos opciones válidas');
                return;
            }
        }

        setIsSubmitting(true);
        setError('');

        try {
            if (onSubmit) {
                // Si hay título, enviarlo; de lo contrario, usar el contenido como título también
                const title = postTitle.trim() || postContent.split('\n')[0]; // Usar la primera línea como título si no hay título
                
                // Filtrar opciones de encuesta válidas
                const validPollOptions = showPollCreator 
                    ? pollOptions.filter(option => option.text.trim().length > 0)
                    : undefined;
                
                const success = await onSubmit(
                    postContent, 
                    title, 
                    selectedCategory, 
                    attachments.length > 0 ? attachments : undefined,
                    showVideoInput && videoUrl ? videoUrl : undefined,
                    showLinkInput && linkUrl ? linkUrl : undefined,
                    validPollOptions && validPollOptions.length >= 2 ? validPollOptions : undefined
                );

                if (success) {
                    // Limpiar el formulario y cerrar
                    setPostTitle('');
                    setPostContent('');
                    setSelectedCategory(undefined);
                    setAttachments([]);
                    setLinkUrl('');
                    setVideoUrl('');
                    setPollOptions([{ id: 1, text: '' }, { id: 2, text: '' }]);
                    setShowAttachmentPreview(false);
                    setShowLinkInput(false);
                    setShowVideoInput(false);
                    setShowPollCreator(false);
                    setShowEmojiPicker(false);
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
                                <div className="absolute -bottom-1 -right-1 z-10">
                                    <UserLevelBadge level={user.level} size="sm" showTooltip={false} />
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
                                    <div className="absolute -bottom-1 -right-1 z-10">
                                        <UserLevelBadge level={user.level} size="sm" showTooltip={true} />
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
                                placeholder="Título"
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

                        {/* Previsualización de archivos adjuntos */}
                        {showAttachmentPreview && attachments.length > 0 && (
                            <div className="mb-4 p-3 bg-[#444442] rounded-lg border border-white/10">
                                <h3 className="text-sm font-medium text-zinc-300 mb-2">
                                    Archivos adjuntos ({attachments.length})
                                    {attachments.filter(file => file.type.startsWith('image/')).length > 0 && 
                                        <span className="text-xs ml-2 text-blue-300">
                                            {attachments.filter(file => file.type.startsWith('image/')).length === 1 
                                                ? 'La imagen se mostrará en el post'
                                                : `${attachments.filter(file => file.type.startsWith('image/')).length} imágenes se mostrarán en el post`}
                                            <span className="text-xs ml-1 text-zinc-300">(máx. 3)</span>
                                        </span>
                                    }
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {attachments.map((file, index) => (
                                        <div 
                                            key={index} 
                                            className={`flex items-center gap-2 p-2 rounded border border-white/10 ${
                                                index === 0 && file.type.startsWith('image/') 
                                                ? 'bg-[#2a3144]' 
                                                : 'bg-[#323230]'
                                            }`}
                                        >
                                            {file.type.startsWith('image/') && (
                                                <div className="w-8 h-8 flex-shrink-0 bg-[#444442] rounded overflow-hidden">
                                                    <img 
                                                        src={URL.createObjectURL(file)} 
                                                        alt="Preview" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <span className={`text-xs ${index === 0 && file.type.startsWith('image/') ? 'text-blue-300' : 'text-zinc-300'} max-w-[150px] truncate`}>
                                                {file.name}
                                                {file.type.startsWith('image/') && index === 0 ? ' (principal)' : ''}
                                            </span>
                                            <button 
                                                onClick={() => handleRemoveAttachment(index)}
                                                className="text-zinc-400 hover:text-zinc-200"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Campo de entrada para link */}
                        {showLinkInput && (
                            <div className="mb-4 p-3 bg-[#444442] rounded-lg border border-white/10">
                                <h3 className="text-sm font-medium text-zinc-300 mb-2">Añadir enlace</h3>
                                <input
                                    type="text"
                                    placeholder="https://ejemplo.com"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    className="w-full bg-[#323230] text-white px-3 py-2 rounded border border-white/10 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        )}

                        {/* Campo de entrada para video */}
                        {showVideoInput && (
                            <div className="mb-4 p-3 bg-[#444442] rounded-lg border border-white/10">
                                <h3 className="text-sm font-medium text-zinc-300 mb-2">Añadir video</h3>
                                <input
                                    type="text"
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    className="w-full bg-[#323230] text-white px-3 py-2 rounded border border-white/10 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        )}

                        {/* Creador de encuestas */}
                        {showPollCreator && (
                            <div className="mb-4 p-3 bg-[#444442] rounded-lg border border-white/10">
                                <h3 className="text-sm font-medium text-zinc-300 mb-2">Crear encuesta</h3>
                                <div className="space-y-2 mb-3">
                                    {pollOptions.map((option) => (
                                        <div key={option.id} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                placeholder={`Opción ${option.id}`}
                                                value={option.text}
                                                onChange={(e) => handlePollOptionChange(option.id, e.target.value)}
                                                className="flex-1 bg-[#323230] text-white px-3 py-2 rounded border border-white/10 focus:outline-none focus:border-blue-500"
                                            />
                                            {pollOptions.length > 2 && (
                                                <button 
                                                    onClick={() => handleRemovePollOption(option.id)}
                                                    className="text-zinc-400 hover:text-zinc-200"
                                                >
                                                    <X size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    onClick={handleAddPollOption}
                                    className="text-sm text-blue-400 hover:text-blue-300"
                                >
                                    + Añadir opción
                                </button>
                            </div>
                        )}

                        {/* Selector de emojis simple */}
                        {showEmojiPicker && (
                            <div 
                                ref={emojiPickerRef} 
                                className="mb-4 p-3 bg-[#444442] rounded-lg border border-white/10 z-50 max-h-60 overflow-y-auto"
                            >
                                <div className="flex flex-wrap gap-2">
                                    {commonEmojis.map((emoji, index) => (
                                        <button 
                                            key={index}
                                            onClick={() => handleEmojiSelect(emoji)}
                                            className="w-8 h-8 flex items-center justify-center hover:bg-[#323230] rounded-md text-lg"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Barra de herramientas */}
                        <div className="flex flex-wrap items-center">
                            <div className="flex flex-wrap space-x-2 mb-2 sm:mb-0">
                                <button 
                                    onClick={handleAttachFile}
                                    className={`p-2 text-zinc-300 hover:bg-[#444442] rounded-full transition-colors border border-white/5 ${showAttachmentPreview ? 'bg-[#444442]' : ''}`}
                                >
                                    <Paperclip size={20} />
                                </button>
                                <button 
                                    onClick={handleLinkButton}
                                    className={`p-2 text-zinc-300 hover:bg-[#444442] rounded-full transition-colors border border-white/5 ${showLinkInput ? 'bg-[#444442]' : ''}`}
                                >
                                    <Link2 size={20} />
                                </button>
                                <button 
                                    onClick={handleVideoButton}
                                    className={`p-2 text-zinc-300 hover:bg-[#444442] rounded-full transition-colors border border-white/5 ${showVideoInput ? 'bg-[#444442]' : ''}`}
                                >
                                    <Video size={20} />
                                </button>
                                <button 
                                    onClick={handlePollButton}
                                    className={`p-2 text-zinc-300 hover:bg-[#444442] rounded-full transition-colors border border-white/5 ${showPollCreator ? 'bg-[#444442]' : ''}`}
                                >
                                    <BarChart2 size={20} />
                                </button>
                                <button 
                                    onClick={handleEmojiButton}
                                    className={`p-2 text-zinc-300 hover:bg-[#444442] rounded-full transition-colors border border-white/5 ${showEmojiPicker ? 'bg-[#444442]' : ''}`}
                                >
                                    <Smile size={20} />
                                </button>
                                
                                {/* Input oculto para la selección de archivos */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    multiple
                                />
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