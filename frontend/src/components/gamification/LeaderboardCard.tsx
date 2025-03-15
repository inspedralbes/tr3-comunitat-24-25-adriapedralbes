import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from '@/types/user';
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';

interface LeaderboardCardProps {
  title?: string;
  period?: 'all' | 'month' | 'week';
  maxItems?: number;
  showFilters?: boolean;
  className?: string;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  title = 'Tabla de Clasificación',
  period: initialPeriod = 'all',
  maxItems = 5,
  showFilters = true,
  className = ''
}) => {
  const [period, setPeriod] = useState<'all' | 'month' | 'week'>(initialPeriod);

  // Estado local para gestionar la carga
  const [isLoading, setIsLoading] = useState(false);

  // Datos mock de ejemplo para el leaderboard
  const mockLeaderboard = [
    { id: 1, position: 1, username: 'maria_gonzalez', level: 8, points: 3450, avatar_url: '' },
    { id: 2, position: 2, username: 'carlos93', level: 7, points: 2980, avatar_url: '' },
    { id: 3, position: 3, username: 'laura_dev', level: 6, points: 2340, avatar_url: '' },
    { id: 4, position: 4, username: 'davidcode', level: 5, points: 1890, avatar_url: '' },
    { id: 5, position: 5, username: 'elena_tech', level: 4, points: 1350, avatar_url: '' },
    { id: 6, position: 6, username: 'robert_js', level: 4, points: 1290, avatar_url: '' },
  ];
  
  const leaderboard = mockLeaderboard;

  // Función para obtener el color del badge según el nivel
  const getLevelBadgeColor = (level: number) => {    
    // Colores por defecto
    const defaultColors: Record<number, string> = {
      1: 'bg-gray-500',
      2: 'bg-green-500',
      3: 'bg-blue-500',
      4: 'bg-indigo-500',
      5: 'bg-purple-500',
      6: 'bg-pink-500',
      7: 'bg-red-500',
      8: 'bg-yellow-500',
      9: 'bg-amber-500',
      10: 'bg-orange-500'
    };
    
    return defaultColors[level] || 'bg-blue-500';
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          
          {showFilters && (
            <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          // Skeleton mientras carga
          <div className="space-y-3">
            {[...Array(maxItems)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard?.slice(0, maxItems).map((user: User & { position: number }) => (
              <Link 
                href={`/profile/${user.username}`} 
                key={user.id} 
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {/* Posición */}
                <div className="w-6 text-center font-medium text-gray-500">
                  {user.position}.
                </div>
                
                {/* Avatar */}
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url} alt={user.username} />
                  <AvatarFallback className="bg-gray-200 dark:bg-gray-700">
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {/* Nombre y nivel */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{user.username}</p>
                    <div 
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs text-white ${getLevelBadgeColor(user.level)}`}
                    >
                      {user.level}
                    </div>
                  </div>
                </div>
                
                {/* Puntos */}
                <div className="text-sm font-medium">{user.points} pts</div>
              </Link>
            ))}
            
            {/* Ver más link */}
            {leaderboard && leaderboard.length > maxItems && (
              <div className="text-center pt-1">
                <Link 
                  href="/leaderboard" 
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Ver clasificación completa
                </Link>
              </div>
            )}
            
            {/* Mensaje si no hay usuarios */}
            {(!leaderboard || leaderboard.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No hay usuarios en la clasificación
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaderboardCard;
