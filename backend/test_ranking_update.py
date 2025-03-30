#!/usr/bin/env python
"""
Script para aumentar los puntos de un usuario y activar la actualización del ranking en tiempo real.
Este script se puede ejecutar desde la línea de comandos para simular un usuario ganando puntos
y desencadenar la animación en el frontend.
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Importar modelos y servicios necesarios
from api.models import User
from api.gamification.services import award_points
from api.sockets import emit_ranking_update
from django.utils import timezone
from django.db.models import Count

def update_user_points(username, points_to_add):
    """
    Actualiza los puntos de un usuario directamente y emite la actualización.
    
    Args:
        username: Nombre de usuario a actualizar
        points_to_add: Cantidad de puntos a añadir
    """
    try:
        # Obtener el usuario
        user = User.objects.get(username=username)
        
        # Guardar puntos actuales para mostrar la diferencia
        old_points = user.points
        old_position = User.objects.filter(points__gt=user.points).count() + 1
        
        print(f"Usuario: {user.username}")
        print(f"Puntos actuales: {old_points}")
        print(f"Posición actual: {old_position}")
        
        # Añadir puntos directamente
        user.points += points_to_add
        user.save()
        
        # Recalcular posición después de actualizar puntos
        new_position = User.objects.filter(points__gt=user.points).count() + 1
        
        print(f"Nuevos puntos: {user.points} (+{points_to_add})")
        print(f"Nueva posición: {new_position}")
        
        # Emitir actualización para el frontend a través de sockets
        # Construir datos del usuario para la actualización
        from datetime import datetime
        user_data = {
            'id': str(user.id),  # Convertir a string para evitar problemas de serialización
            'username': user.username,
            'points': user.points,
            'level': user.level,
            'position': new_position,
            'avatar_url': user.avatar_url.url if user.avatar_url else (
                user.avatar_url_external or None
            ),
            'timestamp': datetime.now().isoformat()  # Añadir timestamp para eventos en tiempo real
        }
        
        # Imprimir el payload que se enviará
        import json
        print("\nPayload de actualización:")
        print(json.dumps(user_data, indent=2, default=str))
        
        # Emitir evento para actualizar el ranking
        emit_ranking_update(user_data)
        
        # Forzar un pequeño retraso para asegurar que la actualización se emita
        import time
        time.sleep(0.5)
        
        print(f"Evento de actualización emitido para {user.username}")
        print(f"Cambio de posición: {old_position} → {new_position}")
        
        return True
    except User.DoesNotExist:
        print(f"Error: Usuario '{username}' no encontrado")
        return False
    except Exception as e:
        print(f"Error al actualizar puntos: {str(e)}")
        return False

if __name__ == "__main__":
    # Verificar argumentos de línea de comandos
    if len(sys.argv) < 3:
        print("Uso: python test_ranking_update.py <username> <points_to_add>")
        sys.exit(1)
    
    username = sys.argv[1]
    try:
        points_to_add = int(sys.argv[2])
    except ValueError:
        print("Error: El número de puntos debe ser un entero")
        sys.exit(1)
    
    # Actualizar puntos del usuario
    success = update_user_points(username, points_to_add)
    
    if success:
        print("Actualización completada correctamente")
    else:
        print("Error al realizar la actualización")
