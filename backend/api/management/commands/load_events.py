from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Loads the event fixtures into the database'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Loading event fixtures...'))
        try:
            call_command('loaddata', 'api/fixtures/events.json')
            self.stdout.write(self.style.SUCCESS('Successfully loaded event fixtures!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error loading fixtures: {e}'))