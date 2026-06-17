import prisma from '../config/prisma.js';

class QuadraService {
  async getMinhas(arenaUserId) {
    const arena = await prisma.arena.findUnique({ where: { userId: arenaUserId } });
    if (!arena) throw new Error('Arena não encontrada');
    return prisma.quadra.findMany({
      where: { arenaId: arena.id, ativa: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getByArenaId(arenaId) {
    return prisma.quadra.findMany({
      where: { arenaId: Number(arenaId), ativa: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(arenaUserId, { nome, esporte, descricao }) {
    const arena = await prisma.arena.findUnique({ where: { userId: arenaUserId } });
    if (!arena) throw new Error('Arena não encontrada');
    return prisma.quadra.create({
      data: { arenaId: arena.id, nome, esporte, descricao },
    });
  }

  async update(id, arenaUserId, { nome, esporte, descricao }) {
    const quadra = await this._verificarPosse(id, arenaUserId);
    return prisma.quadra.update({
      where: { id: quadra.id },
      data: { nome, esporte, descricao },
    });
  }

  async remove(id, arenaUserId) {
    const quadra = await this._verificarPosse(id, arenaUserId);
    return prisma.quadra.update({
      where: { id: quadra.id },
      data: { ativa: false },
    });
  }

  async _verificarPosse(quadraId, arenaUserId) {
    const arena = await prisma.arena.findUnique({ where: { userId: arenaUserId } });
    if (!arena) throw new Error('Arena não encontrada');
    const quadra = await prisma.quadra.findFirst({
      where: { id: Number(quadraId), arenaId: arena.id },
    });
    if (!quadra) throw new Error('Quadra não encontrada ou sem permissão');
    return quadra;
  }
}

export default new QuadraService();
