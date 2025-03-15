import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { User } from '@/types';
import UserAvatarWithLevel from '@/components/ui/UserAvatarWithLevel';
import Link from 'next/link';
import { LevelProgressBar } from '@/components/gamification';
import { Badge } from '@/components/ui/badge';
import { Calendar, MessageSquare, Award } from 'lucide-react';

interface UserCardProps {
  user: User;
  stats?: {
    posts: number;
    comments: number;
    achievements: number;
  };
  className?: string;
}

export default function UserCard({ user, stats, className }: UserCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Avatar con nivel destacado */}
          <Link href={`/profile/${user.username}`} className="block mt-2">
            <UserAvatarWithLevel 
              user={user} 
              size="xl" 
              showLevel={true}
              levelPosition="bottom-right"
            />
          </Link>
          
          {/* Nombre y nivel/rango */}
          <div>
            <Link href={`/profile/${user.username}`} className="block">
              <h3 className="font-semibold text-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {user.username}
              </h3>
            </Link>
            <span className="text-sm text-gray-500 dark:text-gray-400 block mt-1">
              {getUserTitleByPoints(user.points, user.level)}
            </span>
          </div>
          
          {/* Barra de progreso del nivel con animación */}
          <div className="w-full">
            <LevelProgressBar showNextLevel={false} />
          </div>
          
          {/* Estadísticas */}
          {stats && (
            <div className="flex justify-between w-full text-sm text-gray-600 dark:text-gray-400 mt-2">
              <div className="flex items-center">
                <Calendar size={14} className="mr-1" />
                <span>{stats.posts} posts</span>
              </div>
              <div className="flex items-center">
                <MessageSquare size={14} className="mr-1" />
                <span>{stats.comments} com.</span>
              </div>
              <div className="flex items-center">
                <Award size={14} className="mr-1" />
                <span>{stats.achievements} logros</span>
              </div>
            </div>
          )}
          
          {/* Badges o etiquetas */}
          {user.is_premium && (
            <Badge variant="secondary" className="bg-gradient-to-r from-amber-500 to-yellow-300 text-white">
              Premium
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Función para obtener un título según los puntos/nivel
function getUserTitleByPoints(points: number, level: number): string {
  if (level >= 10) return "Visionario";
  if (level >= 9) return "Leyenda";
  if (level >= 8) return "Gurú";
  if (level >= 7) return "Maestro";
  if (level >= 6) return "Especialista";
  if (level >= 5) return "Experto";
  if (level >= 4) return "Contribuidor";
  if (level >= 3) return "Participante";
  if (level >= 2) return "Aprendiz";
  return "Novato";
}
