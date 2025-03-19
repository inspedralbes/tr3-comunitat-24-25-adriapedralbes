"""
URL configuration for config project.
The `urlpatterns` list routes URLs to views. For more information please see:
 https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
 1. Add an import: from my_app import views
 2. Add a URL to urlpatterns: path('', views.home, name='home')
Class-based views
 1. Add an import: from other_app.views import Home
 2. Add a URL to urlpatterns: path('', Home.as_view(), name='home')
Including another URLconf
 1. Import the include() function: from django.urls import include, path
 2. Add a URL to urlpatterns: path('blog/', include('blog.urls'))
"""
# urls.py en la carpeta config
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import redirect, render
from django.contrib.auth.forms import AuthenticationForm
from django.views.decorators.csrf import csrf_protect
from api.views_security import ratelimited_view, locked_out
import logging
# Configurar logger para registrar intentos de acceso
logger = logging.getLogger(__name__)
def redirect_to_admin(request):
    return redirect('backend-admin/')
@csrf_protect
def admin_honeypot(request):
    """Honeypot simple para el panel de administración"""
    form = AuthenticationForm(request)
    # Registrar intento de acceso
    if request.method == 'POST':
        username = request.POST.get('username', '<none>')
        ip = get_client_ip(request)
        logger.warning(
            f"Intento de acceso al honeypot detectado | Usuario: {username} | IP: {ip} | "
            f"User-Agent: {request.META.get('HTTP_USER_AGENT', '<unknown>')}"
        )
    # Renderizar formulario de login falso
    context = {
        'form': form,
        'site_header': 'Administración de Django',
        'site_title': 'Sitio de administración',
        'title': 'Iniciar sesión',
        'app_path': request.get_full_path(),
    }
    return render(request, 'admin/login.html', context)
def get_client_ip(request):
    """Obtener la IP real del cliente, incluso si está detrás de un proxy"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
# Personalizar títulos del administrador
admin.site.site_header = 'FuturPrive Admin'
admin.site.site_title = 'FuturPrive Admin'
admin.site.index_title = 'Panel de Control'
urlpatterns = [
    path('', redirect_to_admin),
    # Panel de administración falso (honeypot simple)
    path('admin/', admin_honeypot, name='admin_honeypot'),
    # Panel de administración real con una URL diferente
    path('backend-admin/', admin.site.urls),
    path('api/', include('api.urls')),
    # Rutas de seguridad
    path('ratelimited/', ratelimited_view, name='ratelimited'),
    path('accounts/locked/', locked_out, name='locked_out'),
]

# Configuración para servir archivos estáticos en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Siempre servir archivos media independientemente de si estamos en desarrollo o producción
# Esta línea es crucial para resolver el problema de las imágenes no encontradas
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)