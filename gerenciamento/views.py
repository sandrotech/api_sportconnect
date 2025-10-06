from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.response import Response
from knox.models import AuthToken
from knox.views import LoginView as KnoxLoginView
from rest_framework.permissions import IsAuthenticated

from .serializers import ChangePasswordSerializer, UserSerializer


# --- LOGIN ---
class LoginAPI(KnoxLoginView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = AuthTokenSerializer 

    def post(self, request, format=None):
        serializer = AuthTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        return super(LoginAPI, self).post(request, format=None)


# --- LOGOUT ---
class LogoutAPI(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        logout(request)
        return Response({"message": "Logout realizado com sucesso"}, status=status.HTTP_200_OK)


# --- RESETAR SENHA ---
class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    model = User
    permission_classes = (IsAuthenticated,)

    def get_object(self, queryset=None):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            if user.check_password(serializer.data.get("old_password")):
                user.set_password(serializer.data.get("new_password"))
                user.save()
                return Response({
                    'status': 'Sucesso',
                    'message': 'Senha alterada com sucesso!'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'status': 'Erro',
                    'message': 'Senha antiga incorreta.'
                }, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
