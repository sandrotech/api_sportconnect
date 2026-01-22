import prisma from '../config/prisma.js';

class ProfissionalService {
  async getProfile(userId) {
    const profile = await prisma.profissional.findUnique({
      where: { userId },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });

    if (!profile) {
      throw new Error('Perfil profissional não encontrado');
    }

    return profile;
  }
}

export default new ProfissionalService();
