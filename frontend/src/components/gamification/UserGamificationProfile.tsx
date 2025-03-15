import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from '@/types/user';
import LevelProgressBar from './LevelProgressBar';
import UserAchievements from './UserAchievements';
import { Award, Trophy, Calendar, Star, Clock } from 'lucide-react';

interface UserGamificationProfileProps {
  user?: User;
  className?: string;
}

const UserGamificationProfile: React.FC<UserGamificationProfileProps> = ({
  user,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('achievements');

  // Datos simulados
  const mockAchievements = {
    post_count: 12,
    comment_count: 34,
    likes_received: 87,
    likes_given: 56,
    achievements: [
      { id: 1, name: 'Primer Post' },
      { id: 2, name: 'Primer Like' },
      { id: 3, name: 'Primer Comentario' }
    ]
  };
  
  const achievements = mockAchievements;
  const isLoadingAchievements = false;

  // Niveles de ejemplo
  const mockLevels = [
    { level: 1, title: 'Novato', badge_color: 'bg-gray-500', points_required: 0 },
    { level: 2, title: 'Aprendiz', badge_color: 'bg-green-500', points_required: 100 },
    { level: 3, title: 'Participante', badge_color: 'bg-blue-500', points_required: 250 }
  ];
  
  const levels = mockLevels;
  const isLoadingLevels = false;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Trophy size={18} className="text-yellow-500" />
          <span>Progreso y Logros</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Información de nivel y progreso */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Star size={16} className="text-blue-500" />
            Nivel y Progreso
          </h3>
          
          <LevelProgressBar showNextLevel={true} />
          
          {/* Mostrar próximos niveles */}
          {!isLoadingLevels && levels && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {levels.slice(0, 3).map((level) => (
                <div
                  key={level.level}
                  className="text-center p-2 rounded-lg border dark:border-gray-700"
                >
                  <div 
                    className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center text-xs ${level.badge_color} text-white`}
                  >
                    {level.level}
                  </div>
                  <div className="text-xs font-medium">{level.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{level.points_required} pts</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Tabs para logros y estadísticas */}
        <Tabs defaultValue="achievements" onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="achievements" className="flex items-center gap-1">
              <Award size={14} />
              Logros
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-1">
              <Star size={14} />
              Estadísticas
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="achievements" className="pt-4">
            <UserAchievements showAll={true} />
          </TabsContent>
          
          <TabsContent value="stats" className="pt-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard 
                title="Posts Creados" 
                value={achievements?.post_count || 0} 
                icon={<Calendar size={16} className="text-green-500" />} 
              />
              <StatCard 
                title="Comentarios" 
                value={achievements?.comment_count || 0} 
                icon={<Calendar size={16} className="text-blue-500" />} 
              />
              <StatCard 
                title="Likes Recibidos" 
                value={achievements?.likes_received || 0} 
                icon={<Star size={16} className="text-yellow-500" />} 
              />
              <StatCard 
                title="Likes Dados" 
                value={achievements?.likes_given || 0} 
                icon={<Star size={16} className="text-purple-500" />} 
              />
              <StatCard 
                title="Logros Desbloqueados" 
                value={achievements?.achievements?.length || 0} 
                icon={<Trophy size={16} className="text-amber-500" />} 
                colspan={2}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="justify-center border-t pt-4">
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <Clock size={14} />
          Última actualización: Hace 5 minutos
        </div>
      </CardFooter>
    </Card>
  );
};

// Componente para mostrar una estadística
const StatCard: React.FC<{ 
  title: string; 
  value: number; 
  icon: React.ReactNode;
  colspan?: number;
}> = ({ title, value, icon, colspan = 1 }) => (
  <div 
    className="flex flex-col items-center justify-center p-3 rounded-lg border dark:border-gray-700 text-center"
    style={{ gridColumn: colspan > 1 ? `span ${colspan}` : undefined }}
  >
    <div className="flex items-center gap-1 mb-1">
      {icon}
      <span className="text-xs font-medium">{title}</span>
    </div>
    <div className="text-xl font-bold">{value}</div>
  </div>
);

export default UserGamificationProfile;
