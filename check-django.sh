#!/bin/bash

# Verificar si Django está funcionando
echo "Verificando el estado de Django..."

# Intentar hacer una solicitud a la API
response=$(curl -s -o /dev/null -w "%{http_code}" https://api.futurprive.com)

if [ "$response" != "200" ]; then
    echo "Django no está respondiendo correctamente (código $response). Reiniciando..."
    docker-compose -f docker-compose.prod.yml restart django
    echo "Django reiniciado. Espera unos segundos para que se inicie completamente."
    sleep 10
    
    # Verificar nuevamente
    response=$(curl -s -o /dev/null -w "%{http_code}" https://api.futurprive.com)
    if [ "$response" != "200" ]; then
        echo "Django sigue sin responder correctamente (código $response)."
        echo "Mostrando logs para diagnóstico:"
        docker-compose -f docker-compose.prod.yml logs --tail=50 django
    else
        echo "¡Django está funcionando correctamente ahora!"
    fi
else
    echo "Django está funcionando correctamente (código 200)."
fi