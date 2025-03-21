#!/usr/bin/env python
"""
Script para actualizar los permisos de las carpetas de media.
Ejecutar con: python update_permissions.py
"""

import os
import stat
import sys
from pathlib import Path

# Ruta del proyecto
BASE_DIR = Path(__file__).resolve().parent
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
AVATARS_DIR = os.path.join(MEDIA_ROOT, 'avatars')
POST_IMAGES_DIR = os.path.join(MEDIA_ROOT, 'post_images')

def check_permissions(path):
    try:
        stat_info = os.stat(path)
        perms = stat.filemode(stat_info.st_mode)
        print(f"Permisos de {path}: {perms}")
        print(f"   Permisos numéricos: {oct(stat_info.st_mode & 0o777)}")
        return True
    except Exception as e:
        print(f"Error al verificar permisos de {path}: {e}")
        return False

def update_permissions():
    print("=== Verificando permisos actuales ===")
    check_permissions(MEDIA_ROOT)
    check_permissions(AVATARS_DIR)
    check_permissions(POST_IMAGES_DIR)
    
    try:
        print("\n=== Actualizando permisos ===")
        os.chmod(MEDIA_ROOT, 0o775)
        os.chmod(AVATARS_DIR, 0o775)
        os.chmod(POST_IMAGES_DIR, 0o775)
        print("Permisos actualizados correctamente")
        
        # Verificar permisos actualizados
        print("\n=== Verificando nuevos permisos ===")
        check_permissions(MEDIA_ROOT)
        check_permissions(AVATARS_DIR)
        check_permissions(POST_IMAGES_DIR)
        
        # Verificar archivos en cada carpeta
        print("\n=== Verificando archivos en carpeta avatar ===")
        for file in os.listdir(AVATARS_DIR):
            file_path = os.path.join(AVATARS_DIR, file)
            if os.path.isfile(file_path):
                check_permissions(file_path)
                os.chmod(file_path, 0o664)  # Establecer permisos 664 para archivos
                
        print("\n=== Verificando archivos en carpeta post_images ===")
        for file in os.listdir(POST_IMAGES_DIR):
            file_path = os.path.join(POST_IMAGES_DIR, file)
            if os.path.isfile(file_path):
                check_permissions(file_path)
                os.chmod(file_path, 0o664)  # Establecer permisos 664 para archivos
                
        return True
    except Exception as e:
        print(f"Error al actualizar permisos: {e}")
        return False

if __name__ == "__main__":
    print(f"Directorio base: {BASE_DIR}")
    print(f"Directorio media: {MEDIA_ROOT}")
    
    if not os.path.exists(MEDIA_ROOT):
        print(f"Error: La carpeta {MEDIA_ROOT} no existe.")
        sys.exit(1)
    
    if not os.path.exists(AVATARS_DIR):
        print(f"La carpeta {AVATARS_DIR} no existe, creándola...")
        os.makedirs(AVATARS_DIR, exist_ok=True)
    
    if not os.path.exists(POST_IMAGES_DIR):
        print(f"La carpeta {POST_IMAGES_DIR} no existe, creándola...")
        os.makedirs(POST_IMAGES_DIR, exist_ok=True)
    
    success = update_permissions()
    
    print("\n=== Resumen ===")
    if success:
        print("Permisos actualizados correctamente.")
        sys.exit(0)
    else:
        print("Error al actualizar permisos.")
        sys.exit(1)
