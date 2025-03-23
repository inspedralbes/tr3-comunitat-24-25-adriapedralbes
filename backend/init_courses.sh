#!/bin/bash

# Script para inicializar los cursos y lecciones
echo "Iniciando migración de cursos y lecciones..."

# Ejecutar migraciones
python manage.py migrate

# Cargar datos iniciales (fixtures)
echo "Cargando datos iniciales de cursos..."
python manage.py loaddata api/fixtures/courses.json

echo "Cargando datos iniciales de lecciones..."
python manage.py loaddata api/fixtures/lessons.json

echo "¡Inicialización completada!"
