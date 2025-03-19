#!/usr/bin/env python
"""
Script para verificar y crear directorios de media necesarios.
Coloca este archivo en la raíz de tu proyecto Django.
"""
import os
import sys
from pathlib import Path

# Obtener la ruta base del proyecto
BASE_DIR = Path(__file__).resolve().parent

def check_and_create_media_dirs():
    """Verifica y crea los directorios de media necesarios."""
    print("\n🔵 Verificando directorios de media...")
    
    # Definir los directorios que necesitamos
    media_root = os.path.join(BASE_DIR, 'media')
    avatars_dir = os.path.join(media_root, 'avatars')
    post_images_dir = os.path.join(media_root, 'post_images')
    
    # Crear el directorio principal de media si no existe
    if not os.path.exists(media_root):
        print(f"Creando directorio de media: {media_root}")
        os.makedirs(media_root)
    else:
        print(f"✅ Directorio de media ya existe: {media_root}")
    
    # Crear el directorio de avatares si no existe
    if not os.path.exists(avatars_dir):
        print(f"Creando directorio de avatares: {avatars_dir}")
        os.makedirs(avatars_dir)
    else:
        print(f"✅ Directorio de avatares ya existe: {avatars_dir}")
    
    # Crear el directorio de imágenes de posts si no existe
    if not os.path.exists(post_images_dir):
        print(f"Creando directorio de imágenes de posts: {post_images_dir}")
        os.makedirs(post_images_dir)
    else:
        print(f"✅ Directorio de imágenes de posts ya existe: {post_images_dir}")
    
    # Establecer permisos correctos
    print("Estableciendo permisos correctos...")
    for directory in [media_root, avatars_dir, post_images_dir]:
        current_mode = os.stat(directory).st_mode & 0o777
        if current_mode != 0o755:
            os.chmod(directory, 0o755)  # rwxr-xr-x
            print(f"Permisos actualizados para {directory}: 755")
        else:
            print(f"✅ Permisos correctos para {directory}: 755")
    
    print("✅ Verificación completada. Todos los directorios de media existen y tienen los permisos correctos.")
    print("-----------------------------------------------------------")

if __name__ == "__main__":
    check_and_create_media_dirs()