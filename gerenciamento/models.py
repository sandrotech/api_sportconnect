from django.db import models
from django.contrib.auth.models import User, Group



class cargos(models.Model):
    id = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=200, blank=True, null=True)
    def __str__(self):
        return self.nome

class escolaridade(models.Model):
    id = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=200, blank=True, null=True)
    def __str__(self):
        return self.nome


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    groups = models.ManyToManyField(Group)  # Adicionando relacionamento ManyToMany com grupos

    def _str_(self):
        return self.user.username

