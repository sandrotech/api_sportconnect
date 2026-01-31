import prisma from '../config/prisma.js';

class AtletaService {
  async getProfile(userId) {
    const profile = await prisma.atleta.findUnique({
      where: { userId },
      include: { user: { select: { id: true, name: true, email: true, role: true, avatar: true, cpf: true, dataNascimento: true } } },
    });

    if (!profile) {
      throw new Error('Perfil de atleta não encontrado');
    }

    return profile;
  }

  async updateProfile(userId, data) {
    const { name, email, apelido, telefone, localizacao, avatar, cpf, dataNascimento } = data;

    // Transaction to update both User and Atleta tables
    const updatedProfile = await prisma.$transaction(async (prisma) => {
      // Update User info if provided
      if (name || email || avatar || cpf || dataNascimento) {
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
            ...(cpf && { cpf }),
            ...(dataNascimento && { dataNascimento: new Date(dataNascimento) }),
          },
        });
      }

      // Update Atleta info
      return prisma.atleta.update({
        where: { userId },
        data: {
          ...(apelido && { apelido }),
          ...(telefone && { telefone }),
          ...(localizacao && { localizacao }),
        },
        include: { user: { select: { id: true, name: true, email: true, role: true, avatar: true, cpf: true, dataNascimento: true } } },
      });
    });

    return updatedProfile;
  }
}

export default new AtletaService();
