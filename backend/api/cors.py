"""
Utilidades para manejar CORS en la API.
"""
import functools
from rest_framework.response import Response

# Decorador para añadir encabezados CORS a cualquier respuesta
def add_cors_headers(view_func):
    @functools.wraps(view_func)
    def wrapped_view(*args, **kwargs):
        response = view_func(*args, **kwargs)
        
        # Si es un objeto Response de DRF
        if isinstance(response, Response):
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Headers"] = "Accept,Accept-Language,Content-Language,Content-Type,Authorization,X-Requested-With"
            response["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
            response["Access-Control-Max-Age"] = "86400"  # 24 horas
        
        return response
    return wrapped_view