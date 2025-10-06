from django.urls import path
from .views import LoginAPI, LogoutAPI, ChangePasswordView, CargosViewSet, EscolaridadeViewSet, UserProfileViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'cargos', CargosViewSet)
router.register(r'escolaridade', EscolaridadeViewSet)
router.register(r'userprofiles', UserProfileViewSet)

urlpatterns = [
    path('login/', LoginAPI.as_view(), name='login'),
    path('logout/', LogoutAPI.as_view(), name='logout'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
]
