from django.core.management.base import BaseCommand
from django.utils.text import slugify
from api.models import Category

class Command(BaseCommand):
    help = 'Configura datos iniciales para la aplicación'

    def handle(self, *args, **kwargs):
        self.stdout.write('Configurando datos iniciales...')
        
        # Crear categorías por defecto
        categories = self.setup_categories()
        
        self.stdout.write(self.style.SUCCESS(f'✅ Datos iniciales configurados con éxito: {categories} categorías creadas'))
    
    def setup_categories(self):
        """Configura las categorías por defecto"""
        # Definimos las categorías por defecto
        default_categories = [
            {"name": "General", "color": "bg-zinc-700"},
            {"name": "Anuncios", "color": "bg-blue-600"},
            {"name": "Preguntas", "color": "bg-green-600"},
            {"name": "Logros", "color": "bg-yellow-600"}
        ]
        
        count = 0
        # Crear categorías solo si no existen
        for category in default_categories:
            obj, created = Category.objects.get_or_create(
                name=category["name"],
                defaults={
                    "slug": slugify(category["name"]),
                    "color": category["color"]
                }
            )
            
            if created:
                self.stdout.write(f'  - Categoría creada: {category["name"]}')
                count += 1
            else:
                self.stdout.write(f'  - Categoría ya existente: {category["name"]}')
        
        return count
