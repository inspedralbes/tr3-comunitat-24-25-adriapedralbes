"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# urls.py en la carpeta config
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import redirect
from api.views_security import ratelimited_view, locked_out

def redirect_to_admin(request):
    return redirect('backend-admin/')

# Personalizar títulos del administrador
admin.site.site_header = 'FuturPrive Admin'
admin.site.site_title = 'FuturPrive Admin'
admin.site.index_title = 'Panel de Control'

urlpatterns = [
    path('', redirect_to_admin),
    # Trampa de miel para ataques al panel de administración (debe estar antes del admin real)
    path('admin/', include('admin_honeypot.urls', namespace='admin_honeypot')),
    # Panel de administración real con una URL diferente
    path('backend-admin/', admin.site.urls),
    path('api/', include('api.urls')),
    
    # Rutas de seguridad
    path('ratelimited/', ratelimited_view, name='ratelimited'),
    path('accounts/locked/', locked_out, name='locked_out'),
]

# Configuración para servir archivos estáticos y multimedia en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
