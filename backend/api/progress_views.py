from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Count

from .models import Course, Lesson, UserLessonProgress, UserCourseProgress
from .serializers import UserLessonProgressSerializer, UserCourseProgressSerializer

class UserLessonProgressViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar el progreso de las lecciones del usuario.
    """
    serializer_class = UserLessonProgressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtrar queryset por usuario actual y parámetros opcionales"""
        user = self.request.user
        queryset = UserLessonProgress.objects.filter(user=user)
        
        lesson_id = self.request.query_params.get('lesson_id')
        course_id = self.request.query_params.get('course_id')
        
        if lesson_id:
            queryset = queryset.filter(lesson_id=lesson_id)
        
        if course_id:
            queryset = queryset.filter(lesson__course_id=course_id)
        
        return queryset
    
    def perform_create(self, serializer):
        """Guardar el progreso de la lección y actualizar el progreso del curso"""
        # Guardar el progreso de la lección
        instance = serializer.save(
            user=self.request.user,
            completion_date=timezone.now() if serializer.validated_data.get('completed') else None
        )
        
        # Actualizar el progreso del curso
        self._update_course_progress(instance.lesson.course)
    
    def perform_update(self, serializer):
        """Actualizar el progreso de la lección y recalcular el progreso del curso"""
        # Si la lección se marca como completada y no tenía fecha de completado, la añadimos
        if serializer.validated_data.get('completed') and not serializer.instance.completion_date:
            serializer.save(completion_date=timezone.now())
        else:
            serializer.save()
        
        # Actualizar el progreso del curso
        self._update_course_progress(serializer.instance.lesson.course)
    
    def _update_course_progress(self, course):
        """Calcular y actualizar el progreso del curso para el usuario actual"""
        user = self.request.user
        
        # Contar lecciones totales y completadas
        total_lessons = Lesson.objects.filter(course=course).count()
        completed_lessons = UserLessonProgress.objects.filter(
            user=user,
            lesson__course=course,
            completed=True
        ).count()
        
        # Calcular porcentaje
        if total_lessons > 0:
            progress_percentage = (completed_lessons / total_lessons) * 100
        else:
            progress_percentage = 0
        
        # Actualizar o crear el registro de progreso del curso
        user_course_progress, created = UserCourseProgress.objects.update_or_create(
            user=user,
            course=course,
            defaults={
                'progress_percentage': progress_percentage,
                'last_accessed_at': timezone.now()
            }
        )
        
        # Actualizar también el campo progress_percentage del curso
        # (Puede ser útil para administradores que vean el curso)
        # course.progress_percentage = int(progress_percentage)
        # course.save(update_fields=['progress_percentage'])


class UserCourseProgressViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint para consultar el progreso de cursos del usuario.
    """
    serializer_class = UserCourseProgressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Devolver progreso solo del usuario actual"""
        return UserCourseProgress.objects.filter(user=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        """Recuperar progreso de un curso o crearlo si no existe"""
        try:
            return super().retrieve(request, *args, **kwargs)
        except:
            course_id = kwargs.get('pk')
            
            # Buscar el curso
            course = get_object_or_404(Course, pk=course_id)
            
            # Obtener o crear el progreso del curso
            course_progress, created = UserCourseProgress.objects.get_or_create(
                user=request.user,
                course=course,
                defaults={
                    'progress_percentage': 0,
                    'last_accessed_at': timezone.now()
                }
            )
            
            serializer = self.get_serializer(course_progress)
            return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_lesson_complete(self, request, pk=None):
        """
        Marcar una lección como completada y actualizar el progreso del curso.
        Recibe: lesson_id
        """
        course = get_object_or_404(Course, pk=pk)
        lesson_id = request.data.get('lesson_id')
        
        if not lesson_id:
            return Response(
                {'error': 'Se requiere un lesson_id'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar que la lección pertenece al curso
        lesson = get_object_or_404(Lesson, pk=lesson_id, course=course)
        
        # Actualizar o crear el progreso de la lección
        lesson_progress, created = UserLessonProgress.objects.update_or_create(
            user=request.user,
            lesson=lesson,
            defaults={
                'completed': True,
                'completion_date': timezone.now()
            }
        )
        
        # Actualizar el progreso del curso
        total_lessons = Lesson.objects.filter(course=course).count()
        completed_lessons = UserLessonProgress.objects.filter(
            user=request.user,
            lesson__course=course,
            completed=True
        ).count()
        
        # Calcular porcentaje
        if total_lessons > 0:
            progress_percentage = (completed_lessons / total_lessons) * 100
        else:
            progress_percentage = 0
        
        # Actualizar o crear el registro de progreso del curso
        course_progress, created = UserCourseProgress.objects.update_or_create(
            user=request.user,
            course=course,
            defaults={
                'progress_percentage': progress_percentage,
                'last_accessed_at': timezone.now()
            }
        )
        
        serializer = UserCourseProgressSerializer(course_progress)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_lesson_incomplete(self, request, pk=None):
        """
        Marcar una lección como no completada y actualizar el progreso del curso.
        Recibe: lesson_id
        """
        course = get_object_or_404(Course, pk=pk)
        lesson_id = request.data.get('lesson_id')
        
        if not lesson_id:
            return Response(
                {'error': 'Se requiere un lesson_id'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar que la lección pertenece al curso
        lesson = get_object_or_404(Lesson, pk=lesson_id, course=course)
        
        # Actualizar o crear el progreso de la lección
        lesson_progress, created = UserLessonProgress.objects.update_or_create(
            user=request.user,
            lesson=lesson,
            defaults={
                'completed': False,
                'completion_date': None
            }
        )
        
        # Actualizar el progreso del curso
        total_lessons = Lesson.objects.filter(course=course).count()
        completed_lessons = UserLessonProgress.objects.filter(
            user=request.user,
            lesson__course=course,
            completed=True
        ).count()
        
        # Calcular porcentaje
        if total_lessons > 0:
            progress_percentage = (completed_lessons / total_lessons) * 100
        else:
            progress_percentage = 0
        
        # Actualizar o crear el registro de progreso del curso
        course_progress, created = UserCourseProgress.objects.update_or_create(
            user=request.user,
            course=course,
            defaults={
                'progress_percentage': progress_percentage,
                'last_accessed_at': timezone.now()
            }
        )
        
        serializer = UserCourseProgressSerializer(course_progress)
        return Response(serializer.data)
