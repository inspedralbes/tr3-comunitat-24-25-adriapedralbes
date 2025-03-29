"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import MainLayout from "@/components/layouts/MainLayout";
import { MembersList } from "@/components/Members/MembersList";
import { MembersTabs } from "@/components/Members/MembersTabs";
import { authService } from "@/services/auth";
import subscriptionService from "@/services/subscription";
import { userService, User } from "@/services/user";

// Definición del tipo para un miembro con los datos que espera el componente
interface Member {
    id: string;
    username: string;
    handle: string;
    avatarUrl: string;
    level: number;
    description: string;
    isOnline: boolean;
    lastActive: string | null;
    joinedDate: string;
    location: string | null;
    isAdmin?: boolean;
}

export default function MiembrosPage() {
    const router = useRouter();
    const [filter, setFilter] = useState<"all" | "admins" | "online">("all");
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [counts, setCounts] = useState({
        all: 0,
        admins: 0,
        online: 0
    });

    // Verificar autenticación y suscripción
    useEffect(() => {
        // Función para verificar autenticación y suscripción al cargar la página
        const checkAuth = async () => {
            setIsLoading(true);
            
            // Verificar si está autenticado
            if (!authService.isAuthenticated()) {
                router.push('/perfil');
                return;
            }
            
            try {
                // Verificar suscripción
                const subscriptionStatus = await subscriptionService.getSubscriptionStatus().catch(error => {
                    console.error('Error al verificar suscripción:', error);
                    // En caso de error, permitimos acceso temporal
                    return { has_subscription: true, subscription_status: 'temp_access', start_date: null, end_date: null };
                });
                
                console.warn('Estado de suscripción:', subscriptionStatus);
                
                // Si no tiene suscripción, redirigir a la página de perfil
                if (!subscriptionStatus.has_subscription) {
                    console.warn('Usuario sin suscripción, redirigiendo al perfil');
                    router.push('/perfil');
                    return;
                }
                
                // Continuar con la carga de datos
                fetchMembers();
            } catch (error) {
                console.error('Error general al verificar acceso:', error);
                setIsLoading(false);
            }
        };
        
        checkAuth();
    }, [router]);

    // Cargar usuarios cuando se monta el componente
    const fetchMembers = async () => {
        setError("");
        
        try {
            const usersData = await userService.getAllUsers();
            // Datos de usuarios recibidos
            const users = Array.isArray(usersData) ? usersData : 
                         (usersData.results ? usersData.results : []);
                
                // Para los usuarios que no tienen fecha de registro, intentar obtener detalles adicionales
                for (let i = 0; i < users.length; i++) {
                    if ((!users[i].date_joined && !users[i].created_at) && users[i].id) {
                        try {
                            // Obteniendo datos adicionales para el usuario
                            const userData = await userService.getUserById(users[i].id.toString());
                            if (userData && (userData.date_joined || userData.created_at)) {
                                users[i].date_joined = userData.date_joined || users[i].date_joined;
                                users[i].created_at = userData.created_at || users[i].created_at;
                                // Datos adicionales obtenidos
                            }
                        } catch (error) {
                            console.error(`Error al obtener datos adicionales para ${users[i].username}:`, error);
                        }
                    }
                }
                
                // Transformar los datos de usuarios a formato de miembros
                const transformedMembers: Member[] = users.map((user: User) => {
                    // Crear un handle seguro - solo con el nombre de usuario (sin ID)
                    const handle = `@${user.username.toLowerCase().replace(/\s+/g, '-')}`;
                    
                    // Formatear la fecha de unión con manejo de error
                    let joinedDate = 'Desconocido';
                    try {
                        // Intentar usar date_joined primero, luego created_at, finalmente joined_at
                        const dateString = user.date_joined || user.created_at || user.joined_at;
                        
                        if (dateString) {
                            // Imprimir la fecha para depuración
                            // Fecha de registro procesada
                            joinedDate = new Date(dateString).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                            });
                        } else {
                            console.warn('Fecha de registro no disponible para usuario:', user);
                        }
                    } catch (error) {
                        console.warn('Error formateando fecha de unión:', error);
                        // Mantener el valor predeterminado
                    }
                    
                    // Determinar si el usuario es admin, basado en is_superuser o is_staff
                    const isAdmin = user.is_superuser === true || user.is_staff === true;
                    
                    return {
                        id: typeof user.id === 'string' ? user.id : String(user.id || ''),
                        username: user.username,
                        handle: handle,
                        avatarUrl: user.avatar_url || 'https://github.com/shadcn.png',
                        level: user.level || 1,
                        description: user.bio || user.username,
                        isOnline: user.is_online || false,
                        lastActive: user.last_active || null,
                        joinedDate: joinedDate,
                        location: user.location || null,
                        isAdmin: isAdmin
                    };
                });
                
                setMembers(transformedMembers);
                
                // Calcular conteos
                const adminCount = transformedMembers.filter(m => m.isAdmin).length;
                const onlineCount = transformedMembers.filter(m => m.isOnline).length;
                
                setCounts({
                    all: transformedMembers.length,
                    admins: adminCount,
                    online: onlineCount
                });
                
                // Imprimir para depuración
                // Miembros filtrados y contados
            } catch (err) {
                console.error('Error al cargar usuarios:', err);
                setError('Hubo un problema al cargar los miembros. Por favor, intenta nuevamente.');
            } finally {
                setIsLoading(false);
            }
        };

    // Filtrar miembros basado en el filtro activo
    const filteredMembers = members.filter(member => {
        if (filter === "admins") return member.isAdmin;
        if (filter === "online") return member.isOnline;
        return true;
    });

    return (
        <MainLayout activeTab="members">
            <div className="container mx-auto px-4 py-6">
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                        {error}
                    </div>
                )}
                
                {/* Filtros */}
                <div className="flex justify-between items-center mb-6">
                    <MembersTabs
                        counts={counts}
                        activeFilter={filter}
                        onFilterChange={setFilter}
                    />
                </div>

                {/* Lista de miembros */}
                {isLoading ? (
                    <div className="bg-[#1d1d1d] rounded-lg p-6">
                        <div className="animate-pulse space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-start space-x-4 py-4 border-b border-gray-700/50">
                                    <div className="rounded-full bg-gray-700 h-14 w-14"></div>
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                                        <div className="h-3 bg-gray-700 rounded w-1/6"></div>
                                        <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <MembersList members={filteredMembers} />
                )}
            </div>
        </MainLayout>
    );
}