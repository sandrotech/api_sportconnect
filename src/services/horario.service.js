import prisma from '../config/prisma.js';

class HorarioService {
  async getByQuadra(quadraId) {
    return prisma.horarioSlot.findMany({
      where: { quadraId: Number(quadraId) },
      include: {
        reservas: {
          where: { status: { in: ['PENDENTE', 'CONFIRMADA'] } },
          select: { status: true }
        }
      },
      orderBy: [{ data: 'asc' }, { horaInicio: 'asc' }],
    });
  }

  async upsertSlot(arenaUserId, { quadraId, data, horaInicio, disponivel, preco, esporte, duracao, intervalo }) {
    await this._verificarPosseQuadra(quadraId, arenaUserId);
    
    // Verifica se já existe e tem reservas antes de bloquear
    if (!disponivel) {
      const existing = await prisma.horarioSlot.findUnique({
        where: { quadraId_data_horaInicio: { quadraId: Number(quadraId), data, horaInicio: Number(horaInicio) } },
        include: { reservas: { where: { status: { in: ['PENDENTE', 'CONFIRMADA'] } } } }
      });
      if (existing && existing.reservas.length > 0) {
        throw new Error(`O horário das ${horaInicio}:00 possui reservas ativas e não pode ser bloqueado.`);
      }
    }

    return prisma.horarioSlot.upsert({
      where: { quadraId_data_horaInicio: { quadraId: Number(quadraId), data, horaInicio: Number(horaInicio) } },
      update: { disponivel, preco: preco ?? null, esporte: esporte ?? null, duracao: duracao ?? 60, intervalo: intervalo ?? 10 },
      create: { quadraId: Number(quadraId), data, horaInicio: Number(horaInicio), disponivel, preco: preco ?? null, esporte: esporte ?? null, duracao: duracao ?? 60, intervalo: intervalo ?? 10 },
    });
  }

  async saveLote(arenaUserId, slots) {
    // slots: Array<{ quadraId, data, horaInicio, disponivel, preco, esporte, duracao, intervalo }>
    const results = [];
    for (const slot of slots) {
      const saved = await this.upsertSlot(arenaUserId, slot);
      results.push(saved);
    }
    return results;
  }

  async deleteSlot(id, arenaUserId) {
    const slot = await prisma.horarioSlot.findUnique({ 
      where: { id: Number(id) },
      include: { reservas: { where: { status: { in: ['PENDENTE', 'CONFIRMADA'] } } } }
    });
    if (!slot) throw new Error('Slot não encontrado');
    await this._verificarPosseQuadra(slot.quadraId, arenaUserId);
    
    if (slot.reservas.length > 0) {
      throw new Error('Este horário possui reservas ativas e não pode ser apagado. Cancele a reserva primeiro.');
    }

    return prisma.horarioSlot.delete({ where: { id: Number(id) } });
  }

  async getPublico(arenaId) {
    return prisma.horarioSlot.findMany({
      where: { quadra: { arenaId: Number(arenaId), ativa: true }, disponivel: true },
      include: { quadra: { select: { id: true, nome: true, esporte: true } } },
      orderBy: [{ data: 'asc' }, { horaInicio: 'asc' }],
    });
  }

  async _verificarPosseQuadra(quadraId, arenaUserId) {
    const arena = await prisma.arena.findUnique({ where: { userId: arenaUserId } });
    if (!arena) throw new Error('Arena não encontrada');
    const quadra = await prisma.quadra.findFirst({ where: { id: Number(quadraId), arenaId: arena.id } });
    if (!quadra) throw new Error('Quadra não pertence a esta arena');
    return quadra;
  }
}

export default new HorarioService();
