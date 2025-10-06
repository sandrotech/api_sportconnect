from django.contrib.auth.models import User
from rest_framework import serializers
from .models import cargos, escolaridade, UserProfile

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

class CargosSerializer(serializers.ModelSerializer):
    class Meta:
        model = cargos
        fields = '__all__'


class EscolaridadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = escolaridade
        fields = '__all__'


class UserProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # Exibe o username no lugar do ID
    groups = serializers.StringRelatedField(many=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'groups']