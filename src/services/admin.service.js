import prisma from '../config/prisma.js';

class AdminService {
  // ─── Dashboard ───────────────────────────────────────────────────────────────

  async getDashboardStats() {
    const [totalAtletas, totalArenas, totalProfissionais, arenasPendentes] = await Promise.all([
      prisma.atleta.count(),
      prisma.arena.count(),
      prisma.profissional.count(),
      prisma.arena.count({ where: { status: 'PENDING' } }),
    ]);

    // Novos cadastros nos últimos 30 dias agrupados por semana
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, role: true },
      orderBy: { createdAt: 'asc' },
    });

    return {
      totais: { atletas: totalAtletas, arenas: totalArenas, profissionais: totalProfissionais, arenasPendentes },
      recentUsers,
    };
  }

  // ─── Atletas ─────────────────────────────────────────────────────────────────

  async getAtletas({ page = 1, limit = 20, search = '' }) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
            { apelido: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.atleta.findMany({
        where,
        skip,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true, createdAt: true, avatar: true } } },
        orderBy: { user: { createdAt: 'desc' } },
      }),
      prisma.atleta.count({ where }),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getAtleta(id) {
    const atleta = await prisma.atleta.findUnique({
      where: { id: Number(id) },
      include: { user: true },
    });
    if (!atleta) throw new Error('Atleta não encontrado.');
    return atleta;
  }

  async updateAtleta(id, body) {
    const { name, email, apelido, telefone, localizacao, ranking } = body;

    return prisma.$transaction(async (tx) => {
      const atleta = await tx.atleta.findUnique({ where: { id: Number(id) } });
      if (!atleta) throw new Error('Atleta não encontrado.');

      if (name || email) {
        await tx.user.update({
          where: { id: atleta.userId },
          data: { ...(name && { name }), ...(email && { email }) },
        });
      }

      return tx.atleta.update({
        where: { id: Number(id) },
        data: {
          ...(apelido !== undefined && { apelido }),
          ...(telefone !== undefined && { telefone }),
          ...(localizacao !== undefined && { localizacao }),
          ...(ranking !== undefined && { ranking: Number(ranking) }),
        },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
    });
  }

  async deleteAtleta(id) {
    const atleta = await prisma.atleta.findUnique({ where: { id: Number(id) } });
    if (!atleta) throw new Error('Atleta não encontrado.');

    await prisma.atleta.delete({ where: { id: Number(id) } });
    await prisma.user.delete({ where: { id: atleta.userId } });
    return { message: 'Atleta removido com sucesso.' };
  }

  // ─── Arenas ──────────────────────────────────────────────────────────────────

  async getArenas({ page = 1, limit = 20, search = '', status = '' }) {
    const skip = (page - 1) * limit;
    const where = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { nomeArena: { contains: search, mode: 'insensitive' } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.arena.findMany({
        where,
        skip,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true, createdAt: true, avatar: true } } },
        orderBy: { user: { createdAt: 'desc' } },
      }),
      prisma.arena.count({ where }),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getArena(id) {
    const arena = await prisma.arena.findUnique({
      where: { id: Number(id) },
      include: { user: true },
    });
    if (!arena) throw new Error('Arena não encontrada.');
    return arena;
  }

  async updateArena(id, body) {
    const { name, email, nomeArena, cnpj } = body;

    return prisma.$transaction(async (tx) => {
      const arena = await tx.arena.findUnique({ where: { id: Number(id) } });
      if (!arena) throw new Error('Arena não encontrada.');

      if (name || email) {
        await tx.user.update({
          where: { id: arena.userId },
          data: { ...(name && { name }), ...(email && { email }) },
        });
      }

      return tx.arena.update({
        where: { id: Number(id) },
        data: {
          ...(nomeArena && { nomeArena }),
          ...(cnpj && { cnpj }),
        },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
    });
  }

  async updateArenaStatus(id, status) {
    const arena = await prisma.arena.findUnique({ where: { id: Number(id) } });
    if (!arena) throw new Error('Arena não encontrada.');

    return prisma.arena.update({
      where: { id: Number(id) },
      data: { status },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async deleteArena(id) {
    const arena = await prisma.arena.findUnique({ where: { id: Number(id) } });
    if (!arena) throw new Error('Arena não encontrada.');

    await prisma.arena.delete({ where: { id: Number(id) } });
    await prisma.user.delete({ where: { id: arena.userId } });
    return { message: 'Arena removida com sucesso.' };
  }

  // ─── Profissionais ───────────────────────────────────────────────────────────

  async getProfissionais({ page = 1, limit = 20, search = '' }) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
            { especialidade: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.profissional.findMany({
        where,
        skip,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true, createdAt: true, avatar: true } } },
        orderBy: { user: { createdAt: 'desc' } },
      }),
      prisma.profissional.count({ where }),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getProfissional(id) {
    const prof = await prisma.profissional.findUnique({
      where: { id: Number(id) },
      include: { user: true },
    });
    if (!prof) throw new Error('Profissional não encontrado.');
    return prof;
  }

  async updateProfissional(id, body) {
    const { name, email, especialidade, valorHora } = body;

    return prisma.$transaction(async (tx) => {
      const prof = await tx.profissional.findUnique({ where: { id: Number(id) } });
      if (!prof) throw new Error('Profissional não encontrado.');

      if (name || email) {
        await tx.user.update({
          where: { id: prof.userId },
          data: { ...(name && { name }), ...(email && { email }) },
        });
      }

      return tx.profissional.update({
        where: { id: Number(id) },
        data: {
          ...(especialidade && { especialidade }),
          ...(valorHora !== undefined && { valorHora: Number(valorHora) }),
        },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
    });
  }

  async deleteProfissional(id) {
    const prof = await prisma.profissional.findUnique({ where: { id: Number(id) } });
    if (!prof) throw new Error('Profissional não encontrado.');

    await prisma.profissional.delete({ where: { id: Number(id) } });
    await prisma.user.delete({ where: { id: prof.userId } });
    return { message: 'Profissional removido com sucesso.' };
  }
}

export default new AdminService();
