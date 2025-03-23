#!/usr/bin/env python
import os
import django
from django.core.management import call_command

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Crear migraciones
print("Creando migraciones...")
call_command('makemigrations')

# Aplicar migraciones
print("Aplicando migraciones...")
call_command('migrate')

print("¡Migraciones completadas con éxito!")
