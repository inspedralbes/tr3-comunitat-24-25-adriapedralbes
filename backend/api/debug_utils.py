"""
Utilidades de depuración para el proyecto.
"""
import logging
import traceback
import os
import sys
from django.conf import settings

logger = logging.getLogger(__name__)

def log_request_details(request, prefix="DEBUG"):
    """
    Registra detalles de la solicitud para diagnóstico.
    """
    log_lines = [
        f"{prefix} REQUEST DETAILS",
        f"Method: {request.method}",
        f"Path: {request.path}",
        f"User: {request.user}",
        f"Authenticated: {request.user.is_authenticated}",
        "Headers:",
    ]
    
    for header, value in request.META.items():
        if header.startswith('HTTP_'):
            log_lines.append(f"    {header}: {value}")
    
    if request.method in ['POST', 'PUT', 'PATCH']:
        log_lines.append("POST Data:")
        for key, value in request.POST.items():
            if len(str(value)) > 100:
                value = str(value)[:100] + "... [truncated]"
            log_lines.append(f"    {key}: {value}")
        
        log_lines.append("FILES:")
        for key, file in request.FILES.items():
            log_lines.append(f"    {key}: {file.name} ({file.content_type}, {file.size} bytes)")
    
    for line in log_lines:
        logger.debug(line)

def log_exception(e, prefix="ERROR"):
    """
    Registra una excepción con detalles completos.
    """
    logger.error(f"{prefix} EXCEPTION: {str(e)}")
    logger.error(traceback.format_exc())

def check_media_permissions():
    """
    Verifica y registra los permisos de las carpetas de medios.
    """
    media_root = settings.MEDIA_ROOT
    avatar_dir = os.path.join(media_root, 'avatars')
    post_images_dir = os.path.join(media_root, 'post_images')
    
    log_lines = ["MEDIA PERMISSIONS:"]
    
    try:
        # Verificar existencia
        log_lines.append(f"MEDIA_ROOT ({media_root}): exists={os.path.exists(media_root)}")
        if os.path.exists(media_root):
            # Verificar permisos
            stat_info = os.stat(media_root)
            mode = stat_info.st_mode
            log_lines.append(f"  Mode: {oct(mode & 0o777)}")
            log_lines.append(f"  Owner: {stat_info.st_uid}, Group: {stat_info.st_gid}")
            log_lines.append(f"  Current process: uid={os.getuid()}, gid={os.getgid()}")
        
        # Verificar carpeta avatars
        log_lines.append(f"AVATARS_DIR ({avatar_dir}): exists={os.path.exists(avatar_dir)}")
        if os.path.exists(avatar_dir):
            stat_info = os.stat(avatar_dir)
            log_lines.append(f"  Mode: {oct(stat_info.st_mode & 0o777)}")
        
        # Verificar carpeta post_images
        log_lines.append(f"POST_IMAGES_DIR ({post_images_dir}): exists={os.path.exists(post_images_dir)}")
        if os.path.exists(post_images_dir):
            stat_info = os.stat(post_images_dir)
            log_lines.append(f"  Mode: {oct(stat_info.st_mode & 0o777)}")
        
    except Exception as e:
        log_lines.append(f"Error checking permissions: {str(e)}")
        log_lines.append(traceback.format_exc())
    
    for line in log_lines:
        logger.info(line)
    
    return log_lines
