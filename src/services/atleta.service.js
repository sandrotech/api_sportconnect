import prisma from '../config/prisma.js';

class AtletaService {
  async getProfile(userId) {
    const profile = await prisma.atleta.findUnique({
      where: { userId },
      include: { user: { select: { id: true, name: true, email: true, role: true, avatar: true, banner: true, cpf: true, dataNascimento: true } } },
    });

    if (!profile) {
      throw new Error('Perfil de atleta não encontrado');
    }

    if (profile.esportes) {
      try { profile.esportes = JSON.parse(profile.esportes); } catch(e) {}
    }
    if (profile.notificacoes) {
      try { profile.notificacoes = JSON.parse(profile.notificacoes); } catch(e) {}
    }

    return profile;
  }

  async updateProfile(userId, data) {
    const { name, email, apelido, telefone, localizacao, avatar, banner, cpf, dataNascimento, esportes, nivel, notificacoes } = data;

    // Transaction to update both User and Atleta tables
    const updatedProfile = await prisma.$transaction(async (prisma) => {
      // Update User info if provided
      if (name || email || avatar || banner || cpf || dataNascimento) {
        // Verificar se CPF já existe (se estiver sendo atualizado)
        if (cpf) {
          const existingCpf = await prisma.user.findFirst({
            where: { 
              cpf: cpf,
              NOT: { id: userId }
            }
          });
          if (existingCpf) {
            throw new Error('CPF já cadastrado por outro usuário');
          }
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            ...(name && { name }),
            ...(email && { email }),
            ...(avatar && { avatar }),
            ...(banner && { banner }),
            ...(cpf && { cpf }),
            ...(dataNascimento && { dataNascimento: new Date(dataNascimento) }),
          },
        });
      }

      // Update Atleta info
      return prisma.atleta.update({
        where: { userId },
        data: {
          ...(apelido !== undefined && { apelido }),
          ...(telefone !== undefined && { telefone }),
          ...(localizacao !== undefined && { localizacao }),
          ...(nivel !== undefined && { nivel }),
          ...(esportes !== undefined && { esportes: typeof esportes === 'string' ? esportes : JSON.stringify(esportes) }),
          ...(notificacoes !== undefined && { notificacoes: typeof notificacoes === 'string' ? notificacoes : JSON.stringify(notificacoes) }),
        },
        include: { user: { select: { id: true, name: true, email: true, role: true, avatar: true, banner: true, cpf: true, dataNascimento: true } } },
      });
    });

    if (updatedProfile.esportes) {
      try { updatedProfile.esportes = JSON.parse(updatedProfile.esportes); } catch(e) {}
    }
    if (updatedProfile.notificacoes) {
      try { updatedProfile.notificacoes = JSON.parse(updatedProfile.notificacoes); } catch(e) {}
    }

    return updatedProfile;
  }

  async getByCpf(cpf) {
    const user = await prisma.user.findUnique({
      where: { cpf },
      include: {
        atleta: true
      }
    });

    if (!user || user.role !== 'ATLETA') {
      throw new Error('Atleta não encontrado com este CPF');
    }

    return {
      id: user.id,
      name: user.name,
      telefone: user.atleta?.telefone || '',
      cpf: user.cpf,
    };
  }
}

export default new AtletaService();
