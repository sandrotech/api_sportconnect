from django.contrib.auth.models import User
from rest_framework import serializers


# --- Usuário básico ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


# --- Troca de senha ---
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        # Aqui você pode incluir regras como tamanho mínimo, caracteres especiais etc.
        if len(value) < 6:
            raise serializers.ValidationError("A nova senha deve ter pelo menos 6 caracteres.")
        return value
