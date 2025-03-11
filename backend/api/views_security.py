"""
Vistas relacionadas con seguridad
"""
from django.http import HttpResponse
from django.template.response import TemplateResponse

def ratelimited_view(request, exception=None):
    """Vista para manejar solicitudes limitadas por rate limiting"""
    response = HttpResponse(
        "<h1>Demasiadas solicitudes</h1><p>Has realizado demasiadas solicitudes en poco tiempo. "
        "Por favor, inténtalo de nuevo más tarde.</p>",
        content_type="text/html",
        status=429
    )
    return response

def locked_out(request, credentials=None):
    """Vista para manejar cuentas bloqueadas por demasiados intentos fallidos"""
    return TemplateResponse(
        request=request,
        template="admin/lockout.html",
        status=403
    )
