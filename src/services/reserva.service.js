import prisma from '../config/prisma.js';

class ReservaService {
  async criar(atletaUserId, { quadraId, horarioSlotId, data, esporte }) {
    // Verifica se o slot existe e está disponível
    const slot = await prisma.horarioSlot.findUnique({
      where: { id: Number(horarioSlotId) },
      include: { quadra: true },
    });
    if (!slot) throw new Error('Horário não encontrado');
    if (!slot.disponivel) throw new Error('Horário não está disponível');
    if (slot.quadraId !== Number(quadraId)) throw new Error('Slot não pertence à quadra informada');

    // Verifica se já existe reserva PENDENTE ou CONFIRMADA nesse slot nessa data
    const dataObj = new Date(data);
    const inicioDia = new Date(dataObj.setHours(0, 0, 0, 0));
    const fimDia = new Date(dataObj.setHours(23, 59, 59, 999));
    const conflito = await prisma.reserva.findFirst({
      where: {
        quadraId: Number(quadraId),
        horarioSlotId: Number(horarioSlotId),
        data: { gte: inicioDia, lte: fimDia },
        status: { in: ['PENDENTE', 'CONFIRMADA'] },
      },
    });
    if (conflito) throw new Error('Horário já reservado para essa data');

    return prisma.reserva.create({
      data: {
        quadraId: Number(quadraId),
        horarioSlotId: Number(horarioSlotId),
        atletaUserId,
        data: new Date(data),
        esporte,
        valorPago: slot.preco,
        status: 'PENDENTE',
      },
      include: { quadra: { select: { nome: true, esportes: true } }, horarioSlot: true },
    });
  }

  async minhas(atletaUserId) {
    return prisma.reserva.findMany({
      where: { atletaUserId },
      include: {
        quadra: { select: { nome: true, esportes: true, arena: { select: { nomeArena: true, endereco: true, cidade: true } } } },
        horarioSlot: true,
      },
      orderBy: { data: 'desc' },
    });
  }

  async daArena(arenaUserId) {
    const arena = await prisma.arena.findUnique({ where: { userId: arenaUserId } });
    if (!arena) throw new Error('Arena não encontrada');
    return prisma.reserva.findMany({
      where: { quadra: { arenaId: arena.id } },
      include: {
        quadra: { select: { nome: true, esportes: true } },
        horarioSlot: true,
        atletaUser: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { data: 'desc' },
    });
  }

  async atualizarStatus(id, arenaUserId, status) {
    const arena = await prisma.arena.findUnique({ where: { userId: arenaUserId } });
    if (!arena) throw new Error('Arena não encontrada');
    const reserva = await prisma.reserva.findFirst({
      where: { id: Number(id), quadra: { arenaId: arena.id } },
    });
    if (!reserva) throw new Error('Reserva não encontrada ou sem permissão');
    return prisma.reserva.update({
      where: { id: Number(id) },
      data: { status },
    });
  }
}

export default new ReservaService();
