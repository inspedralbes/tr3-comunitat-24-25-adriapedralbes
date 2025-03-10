from django.contrib.admin.sites import AdminSite
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
from django.template.response import TemplateResponse

class CustomAdminSite(AdminSite):
    site_header = 'DevAccelerator Admin'
    site_title = 'DevAccelerator Admin'
    index_title = 'Panel de Control'
    site_url = '/'
    
    def get_app_list(self, request):
        """Customize the app list to reorder apps."""
        app_list = super().get_app_list(request)
        # Ordena las aplicaciones de acuerdo a tus preferencias.
        return sorted(app_list, key=lambda x: x['name'])
    
    def index(self, request, extra_context=None):
        """Customize the index page with statistics."""
        from .models import User, Post, Comment, Category, Subscriber
        
        # Get today's date and the date one month ago
        today = timezone.now().date()
        month_ago = today - timedelta(days=30)
        
        # Prepare extra context with statistics
        stats_context = {
            'user_count': User.objects.count(),
            'premium_user_count': User.objects.filter(is_premium=True).count(),
            'post_count': Post.objects.count(),
            'pinned_post_count': Post.objects.filter(is_pinned=True).count(),
            'comment_count': Comment.objects.count(),
            'today_comment_count': Comment.objects.filter(created_at__date=today).count(),
            'category_count': Category.objects.count(),
            'subscriber_count': Subscriber.objects.count(),
            'confirmed_subscriber_count': Subscriber.objects.filter(confirmed=True).count(),
            'recent_posts': Post.objects.order_by('-created_at')[:5],
            'recent_users': User.objects.order_by('-created_at')[:5],
            'title': 'Panel de Control',
        }
        
        # Combine with any extra context that might have been passed
        context = extra_context or {}
        context.update(stats_context)
        
        # Get the default app_list
        app_list = self.get_app_list(request)
        
        # Create the final context
        admin_context = {
            **self.each_context(request),
            'title': context.get('title', self.index_title),
            'subtitle': None,
            'app_list': app_list,
            **context,
        }
        
        template_name = self.index_template or 'admin/index.html'
        
        # Return the response with our custom template
        return TemplateResponse(request, template_name, admin_context)
