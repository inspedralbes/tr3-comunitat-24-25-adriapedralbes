import time
import smtplib
import socket
from django.conf import settings

def test_email_connection():
    """
    Prueba la conexión SMTP y devuelve un diagnóstico detallado.
    """
    results = {
        "success": False,
        "errors": [],
        "connection_details": {
            "host": settings.EMAIL_HOST,
            "port": settings.EMAIL_PORT,
            "use_tls": settings.EMAIL_USE_TLS,
            "use_ssl": settings.EMAIL_USE_SSL,
            "timeout": settings.EMAIL_TIMEOUT
        }
    }
    
    try:
        # Intentar conexión básica TCP al servidor
        start_time = time.time()
        sock = socket.create_connection(
            (settings.EMAIL_HOST, settings.EMAIL_PORT),
            timeout=settings.EMAIL_TIMEOUT
        )
        sock.close()
        connection_time = time.time() - start_time
        results["tcp_connection"] = {
            "success": True,
            "time": f"{connection_time:.2f} segundos"
        }
    except Exception as e:
        results["tcp_connection"] = {
            "success": False,
            "error": str(e)
        }
        results["errors"].append(f"TCP connection failed: {str(e)}")
        return results  # Si no puede conectar a nivel TCP, terminamos aquí
    
    # Intentar establecer sesión SMTP
    try:
        start_time = time.time()
        if settings.EMAIL_USE_SSL:
            server = smtplib.SMTP_SSL(
                settings.EMAIL_HOST,
                settings.EMAIL_PORT,
                timeout=settings.EMAIL_TIMEOUT
            )
        else:
            server = smtplib.SMTP(
                settings.EMAIL_HOST,
                settings.EMAIL_PORT,
                timeout=settings.EMAIL_TIMEOUT
            )
        
        smtp_connection_time = time.time() - start_time
        results["smtp_connection"] = {
            "success": True,
            "time": f"{smtp_connection_time:.2f} segundos"
        }
        
        # Intento de handshake TLS si está configurado
        if settings.EMAIL_USE_TLS:
            try:
                start_time = time.time()
                server.starttls()
                tls_time = time.time() - start_time
                results["tls_handshake"] = {
                    "success": True,
                    "time": f"{tls_time:.2f} segundos"
                }
            except Exception as e:
                results["tls_handshake"] = {
                    "success": False,
                    "error": str(e)
                }
                results["errors"].append(f"TLS handshake failed: {str(e)}")
                server.quit()
                return results
        
        # Intento de login
        try:
            start_time = time.time()
            server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
            login_time = time.time() - start_time
            results["login"] = {
                "success": True,
                "time": f"{login_time:.2f} segundos"
            }
            results["success"] = True
        except Exception as e:
            results["login"] = {
                "success": False,
                "error": str(e)
            }
            results["errors"].append(f"Login failed: {str(e)}")
        
        # Cerrar conexión
        server.quit()
        
    except Exception as e:
        results["smtp_connection"] = {
            "success": False,
            "error": str(e)
        }
        results["errors"].append(f"SMTP connection failed: {str(e)}")
    
    return results