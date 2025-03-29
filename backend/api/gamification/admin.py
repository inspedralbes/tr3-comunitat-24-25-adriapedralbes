from django.contrib import admin
from .models import UserLevel, UserAction, UserActionLog, UserAchievement, UserAchievementUnlock
from django.utils.html import format_html

@admin.register(UserLevel)
class UserLevelAdmin(admin.ModelAdmin):
    list_display = ('level', 'title', 'points_required', 'get_badge_color')
    search_fields = ('title',)
    ordering = ('level',)
    
    def get_badge_color(self, obj):
        return format_html('<div style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</div>', 
                          obj.badge_color.replace('bg-', '').replace('-500', ''), 
                          obj.badge_color)
    get_badge_color.short_description = 'Color'

@admin.register(UserAction)
class UserActionAdmin(admin.ModelAdmin):
    list_display = ('action_type', 'points', 'description', 'is_active')
    list_filter = ('is_active', 'action_type')
    search_fields = ('description', 'action_type')
    list_editable = ('points', 'is_active')

@admin.register(UserActionLog)
class UserActionLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'points_earned', 'reference_id', 'created_at')
    list_filter = ('action', 'created_at')
    search_fields = ('user__username', 'reference_id')
    date_hierarchy = 'created_at'
    raw_id_fields = ('user', 'action')

@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ('name', 'achievement_type', 'required_value', 'points_reward', 'get_badge_color', 'is_hidden')
    list_filter = ('achievement_type', 'is_hidden')
    search_fields = ('name', 'description')
    list_editable = ('points_reward', 'is_hidden')
    
    def get_badge_color(self, obj):
        return format_html('<div style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</div>', 
                          obj.badge_color.replace('bg-', '').replace('-500', ''), 
                          obj.badge_color)
    get_badge_color.short_description = 'Color'

@admin.register(UserAchievementUnlock)
class UserAchievementUnlockAdmin(admin.ModelAdmin):
    list_display = ('user', 'achievement', 'unlocked_at')
    list_filter = ('unlocked_at', 'achievement')
    search_fields = ('user__username', 'achievement__name')
    date_hierarchy = 'unlocked_at'
    raw_id_fields = ('user', 'achievement')
