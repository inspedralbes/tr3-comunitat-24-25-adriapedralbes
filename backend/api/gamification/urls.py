from django.urls import path
from .views import (
    user_progression, user_achievements_view, register_daily_login,
    leaderboard_levels, achievement_list, level_distribution
)

urlpatterns = [
    # Rutas para la gamificación
    path('user/progression/', user_progression, name='user-progression'),
    path('user/achievements/', user_achievements_view, name='user-achievements'),
    path('user/daily-login/', register_daily_login, name='user-daily-login'),
    path('levels/', leaderboard_levels, name='leaderboard-levels'),
    path('achievements/', achievement_list, name='achievement-list'),
    path('level-distribution/', level_distribution, name='level-distribution'),
]
