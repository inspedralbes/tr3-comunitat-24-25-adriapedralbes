import { MessageSquare, Megaphone, HelpCircle, Trophy, SlidersHorizontal, ArrowUpNarrowWide, Clock, Pin } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
    color: string;
}

interface CategoryFilterProps {
    activeCategory: string;
    onCategoryChange: (category: string) => void;
    categories?: Category[];
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
    activeCategory,
    onCategoryChange,
    categories = []
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeSortType, setActiveSortType] = useState("default");
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    // Referencias para detectar clics fuera de los dropdowns
    const sortFilterRef = useRef<HTMLDivElement>(null);
    const categoryFilterRef = useRef<HTMLDivElement>(null);

    // Efecto para cerrar los dropdowns al hacer clic fuera de ellos
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Cerrar el dropdown de categorías si está abierto y el clic fue fuera
            if (
                showDropdown &&
                categoryFilterRef.current &&
                !categoryFilterRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }

            // Cerrar el dropdown de filtros si está abierto y el clic fue fuera
            if (
                showSortDropdown &&
                sortFilterRef.current &&
                !sortFilterRef.current.contains(event.target as Node)
            ) {
                setShowSortDropdown(false);
            }
        };

        // Añadir el event listener
        document.addEventListener('mousedown', handleClickOutside);

        // Limpiar el event listener al desmontar el componente
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown, showSortDropdown]);

    // Mapear iconos adecuados en función del slug de categoría
    const getCategoryIcon = (slug: string) => {
        switch(slug) {
            case 'general':
                return <MessageSquare size={16} />;
            case 'anuncios':
                return <Megaphone size={16} />;
            case 'preguntas':
                return <HelpCircle size={16} />;
            case 'logros':
                return <Trophy size={16} />;
            default:
                return <MessageSquare size={16} />;
        }
    };

    // Crear categorías para el componente
    const categoryItems = [
        { id: 'all', label: 'Todos', slug: 'all', icon: null },
        ...(Array.isArray(categories) ? categories.map(cat => ({
            id: cat.slug,
            label: cat.name,
            slug: cat.slug,
            icon: getCategoryIcon(cat.slug)
        })) : [])
    ];

    const sortTypes = [
        { id: 'default', label: 'Default', icon: <Clock size={16} /> },
        { id: 'new', label: 'New', icon: <Clock size={16} /> },
        { id: 'top', label: 'Top', icon: <ArrowUpNarrowWide size={16} /> },
        { id: 'pinned', label: 'Pinned', icon: <Pin size={16} /> },
    ];

    // Encontrar la categoría activa para mostrarla en el móvil
    const activeItem = categoryItems.find(cat => cat.id === activeCategory) || categoryItems[0];
    const activeSortItem = sortTypes.find(sort => sort.id === activeSortType) || sortTypes[0];

    return (
        <div className="mb-4 mx-4 sm:mx-2 md:mx-0">
            {/* Vista móvil - Dropdown */}
            <div className="flex md:hidden flex-col relative" ref={categoryFilterRef}>
                <button
                    className="flex items-center justify-between w-full px-4 py-2 bg-[#323230] rounded-lg text-white border border-white/10"
                    onClick={() => setShowDropdown(!showDropdown)}
                    aria-haspopup="true"
                    aria-expanded={showDropdown}
                >
                    <div className="flex items-center gap-2">
                        {activeItem.icon}
                        <span>{activeItem.label}</span>
                    </div>
                    <SlidersHorizontal size={16} />
                </button>

                {showDropdown && (
                    <div
                        className="absolute top-12 left-0 right-0 bg-[#323230] rounded-lg shadow-lg z-10 border border-white/10"
                        role="menu"
                    >
                        {/* Sección de categorías */}
                        <div className="py-2">
                            {categoryItems.map((category) => (
                                <button
                                    key={category.id}
                                    className={`flex items-center gap-2 px-4 py-2 w-full text-left ${activeCategory === category.id
                                        ? 'bg-[#444442] text-white border-l-2 border-l-white/20'
                                        : 'text-zinc-300 hover:bg-[#444442]'
                                        }`}
                                    onClick={() => {
                                        onCategoryChange(category.id);
                                        setShowDropdown(false);
                                    }}
                                    role="menuitem"
                                >
                                    {category.icon && <span>{category.icon}</span>}
                                    {category.label}
                                </button>
                            ))}
                        </div>

                        {/* Separador */}
                        <div className="border-t border-white/10 mx-2"></div>

                        {/* Sección de ordenamiento */}
                        <div className="py-2">
                            <div className="px-4 py-1 text-xs text-zinc-400 uppercase">Ordenar por</div>
                            {sortTypes.map((sort) => (
                                <button
                                    key={sort.id}
                                    className={`flex items-center gap-2 px-4 py-2 w-full text-left ${activeSortType === sort.id
                                        ? 'bg-amber-500/30 text-amber-400 border-l-2 border-l-amber-500/50'
                                        : 'text-zinc-200 hover:bg-[#444442]'
                                        }`}
                                    onClick={() => {
                                        setActiveSortType(sort.id);
                                        setShowSortDropdown(false);
                                    }}
                                    role="menuitem"
                                >
                                    {sort.icon}
                                    {sort.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Vista desktop - Botones horizontales y dropdown de filtro */}
            <div className="hidden md:flex items-center space-x-2">
                {categoryItems.map((category) => (
                    <button
                        key={category.id}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border ${activeCategory === category.id
                            ? 'bg-[#444442] text-white border-white/20'
                            : 'bg-[#323230]/80 text-zinc-300 hover:bg-[#444442] hover:text-white border-white/10'
                            }`}
                        onClick={() => onCategoryChange(category.id)}
                        data-active={activeCategory === category.id ? "true" : "false"}
                    >
                        {category.icon && <span>{category.icon}</span>}
                        {category.label}
                    </button>
                ))}

                {/* Dropdown de filtro */}
                <div className="relative ml-auto" ref={sortFilterRef}>
                    <button
                        className="bg-[#323230]/80 text-zinc-300 p-1.5 rounded-full hover:bg-[#444442] hover:text-white border border-white/10"
                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                        aria-haspopup="true"
                        aria-expanded={showSortDropdown}
                        aria-label="Sort options"
                    >
                        <SlidersHorizontal size={18} />
                    </button>

                    {showSortDropdown && (
                        <div
                            className="absolute top-full right-0 mt-1 bg-[#323230] rounded-lg shadow-lg z-10 py-0 min-w-[160px] overflow-hidden border border-white/10"
                            role="menu"
                        >
                            {sortTypes.map((sort) => (
                                <button
                                    key={sort.id}
                                    className={`flex items-center gap-2 px-4 py-2 w-full text-left ${activeSortType === sort.id
                                        ? 'bg-amber-500/30 text-amber-400 border-l-2 border-l-amber-500/50'
                                        : 'text-zinc-200 hover:bg-[#444442] hover:text-white'
                                        }`}
                                    onClick={() => {
                                        setActiveSortType(sort.id);
                                        setShowSortDropdown(false);
                                    }}
                                    role="menuitem"
                                    data-selected={activeSortType === sort.id ? "true" : "false"}
                                >
                                    {sort.icon}
                                    {sort.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};