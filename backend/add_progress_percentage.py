#!/usr/bin/env python
import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Intentar agregar la columna progress_percentage si no existe
with connection.cursor() as cursor:
    try:
        print("Verificando si la columna 'progress_percentage' existe...")
        cursor.execute("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'api_course' AND column_name = 'progress_percentage';
        """)
        
        if not cursor.fetchone():
            print("La columna 'progress_percentage' no existe. Agregando...")
            cursor.execute("""
                ALTER TABLE api_course
                ADD COLUMN progress_percentage INTEGER DEFAULT 0;
            """)
            print("Columna 'progress_percentage' agregada exitosamente.")
        else:
            print("La columna 'progress_percentage' ya existe.")
    except Exception as e:
        print(f"Error al verificar o agregar la columna: {e}")

print("Proceso completado.")
