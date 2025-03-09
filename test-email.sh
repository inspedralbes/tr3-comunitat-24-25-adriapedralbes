#!/bin/bash

# Script para probar el envío de correo desde el contenedor Django

echo "Ejecutando prueba de correo dentro del contenedor Django..."

docker compose -f docker-compose.prod.yml exec django python -c "
import os
import smtplib
import sys
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

print('Iniciando prueba de correo...')

try:
    # Configuración de correo (debes ajustarlo según tus variables de entorno)
    email_host = os.environ.get('EMAIL_HOST', 'mail.privateemail.com')
    email_port = int(os.environ.get('EMAIL_PORT', 465))
    email_user = os.environ.get('EMAIL_HOST_USER', 'adria@futurprive.com')
    email_pass = os.environ.get('EMAIL_HOST_PASSWORD', '')
    use_tls = os.environ.get('EMAIL_USE_TLS', 'False') == 'True'
    use_ssl = os.environ.get('EMAIL_USE_SSL', 'True') == 'True'
    
    print(f'Configuración: HOST={email_host}, PORT={email_port}, USER={email_user}, SSL={use_ssl}, TLS={use_tls}')
    
    # Crear mensaje
    msg = MIMEMultipart()
    msg['Subject'] = 'Prueba de correo desde FuturPrive'
    msg['From'] = f'Adrià Estévez <{email_user}>'
    msg['To'] = 'talkcompiler@gmail.com'
    
    # Contenido del mensaje
    text = 'Esta es una prueba de correo enviada desde el servidor de FuturPrive.'
    part = MIMEText(text, 'plain')
    msg.attach(part)
    
    # Conectar al servidor
    print('Conectando al servidor SMTP...')
    if use_ssl:
        server = smtplib.SMTP_SSL(email_host, email_port)
    else:
        server = smtplib.SMTP(email_host, email_port)
        if use_tls:
            server.starttls()
    
    # Iniciar sesión
    print('Iniciando sesión...')
    server.login(email_user, email_pass)
    
    # Enviar correo
    print('Enviando correo...')
    server.send_message(msg)
    server.quit()
    
    print('¡Correo enviado con éxito!')
    sys.exit(0)
    
except Exception as e:
    print(f'Error: {e}')
    sys.exit(1)
"

if [ $? -eq 0 ]; then
    echo "¡El correo se ha enviado correctamente!"
else
    echo "Hubo un problema al enviar el correo. Verifica la configuración."
fi