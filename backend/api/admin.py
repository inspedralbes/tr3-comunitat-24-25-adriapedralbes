from django.contrib import admin
from .models import Subscriber

@admin.register(Subscriber)
class SubscriberAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'confirmed', 'created_at')
    list_filter = ('confirmed', 'created_at')
    search_fields = ('email', 'name')
    readonly_fields = ('confirmation_token', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'
