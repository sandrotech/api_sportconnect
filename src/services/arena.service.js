import prisma from '../config/prisma.js';

class ArenaService {
  async getProfile(userId) {
    const profile = await prisma.arena.findUnique({
      where: { userId },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });

    if (!profile) {
      throw new Error('Perfil de arena não encontrado');
    }

    return profile;
  }
}

export default new ArenaService();
