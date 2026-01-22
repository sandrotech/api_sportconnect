import prisma from '../config/prisma.js';

class AtletaService {
  async getProfile(userId) {
    const profile = await prisma.atleta.findUnique({
      where: { userId },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });

    if (!profile) {
      throw new Error('Perfil de atleta não encontrado');
    }

    return profile;
  }
}

export default new AtletaService();
