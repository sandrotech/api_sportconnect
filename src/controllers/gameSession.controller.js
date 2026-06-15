import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_ROLES = ['OWNER', 'CO_OWNER'];

async function getGroupMember(groupId, userId) {
  return prisma.groupMember.findFirst({
    where: { groupId, userId, status: 'APPROVED' },
  });
}

// ─── CRUD de Sessão ──────────────────────────────────────────────────────────

export const createGameSession = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;
  const {
    title,
    description,
    date,
    arenaId,
    maxStarters,
    maxReserves,
    visibility,
    cancelDeadlineHours,
    autoPromoteReserves,
    fichasPerPlayer,
  } = req.body;

  try {
    const member = await getGroupMember(parseInt(groupId), userId);
    if (!member) {
      return res.status(403).json({ error: 'Você não é membro deste grupo.' });
    }

    const session = await prisma.gameSession.create({
      data: {
        groupId: parseInt(groupId),
        createdByUserId: userId,
        arenaId: arenaId ? parseInt(arenaId) : null,
        title,
        description,
        date: new Date(date),
        maxStarters: maxStarters ? parseInt(maxStarters) : 10,
        maxReserves: maxReserves ? parseInt(maxReserves) : 5,
        visibility: visibility || 'GROUP_ONLY',
        cancelDeadlineHours: cancelDeadlineHours ? parseInt(cancelDeadlineHours) : 24,
        autoPromoteReserves: autoPromoteReserves !== undefined ? autoPromoteReserves : true,
        fichasPerPlayer: fichasPerPlayer ? parseInt(fichasPerPlayer) : 1,
        status: 'OPEN',
      },
      include: {
        arena: { select: { id: true, nomeArena: true } },
        players: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        createdBy: { select: { id: true, name: true } },
      },
    });
    res.status(201).json(session);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao criar sessão de jogo.' });
  }
};

export const getGroupSessions = async (req, res) => {
  const { groupId } = req.params;
  const { status } = req.query;

  try {
    const where = { groupId: parseInt(groupId) };
    if (status) where.status = status;

    const sessions = await prisma.gameSession.findMany({
      where,
      include: {
        arena: { select: { id: true, nomeArena: true } },
        players: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { joinedAt: 'asc' },
        },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { date: 'asc' },
    });
    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar sessões.' });
  }
};

export const getSessionById = async (req, res) => {
  const { groupId, sessionId } = req.params;

  try {
    const session = await prisma.gameSession.findFirst({
      where: { id: parseInt(sessionId), groupId: parseInt(groupId) },
      include: {
        arena: { select: { id: true, nomeArena: true } },
        players: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { joinedAt: 'asc' },
        },
        createdBy: { select: { id: true, name: true } },
        ratings: {
          select: { fromUserId: true, toUserId: true, score: true },
        },
      },
    });
    if (!session) return res.status(404).json({ error: 'Sessão não encontrada.' });
    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar sessão.' });
  }
};

export const updateSession = async (req, res) => {
  const { groupId, sessionId } = req.params;
  const userId = req.user.id;

  try {
    const session = await prisma.gameSession.findFirst({
      where: { id: parseInt(sessionId), groupId: parseInt(groupId) },
    });
    if (!session) return res.status(404).json({ error: 'Sessão não encontrada.' });

    const member = await getGroupMember(parseInt(groupId), userId);
    const isCreator = session.createdByUserId === userId;
    const isAdmin = member && ADMIN_ROLES.includes(member.role);

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ error: 'Sem permissão para editar esta sessão.' });
    }

    if (['FINISHED', 'CANCELLED'].includes(session.status)) {
      return res.status(400).json({ error: 'Não é possível editar uma sessão finalizada ou cancelada.' });
    }

    const { title, description, date, arenaId, maxStarters, maxReserves, visibility, cancelDeadlineHours, autoPromoteReserves, fichasPerPlayer } = req.body;

    const updated = await prisma.gameSession.update({
      where: { id: parseInt(sessionId) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
        ...(arenaId !== undefined && { arenaId: arenaId ? parseInt(arenaId) : null }),
        ...(maxStarters && { maxStarters: parseInt(maxStarters) }),
        ...(maxReserves && { maxReserves: parseInt(maxReserves) }),
        ...(visibility && { visibility }),
        ...(cancelDeadlineHours !== undefined && { cancelDeadlineHours: parseInt(cancelDeadlineHours) }),
        ...(autoPromoteReserves !== undefined && { autoPromoteReserves }),
        ...(fichasPerPlayer !== undefined && { fichasPerPlayer: parseInt(fichasPerPlayer) }),
      },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao atualizar sessão.' });
  }
};

export const cancelSession = async (req, res) => {
  const { groupId, sessionId } = req.params;
  const userId = req.user.id;

  try {
    const session = await prisma.gameSession.findFirst({
      where: { id: parseInt(sessionId), groupId: parseInt(groupId) },
      include: { players: true },
    });
    if (!session) return res.status(404).json({ error: 'Sessão não encontrada.' });

    const member = await getGroupMember(parseInt(groupId), userId);
    const isCreator = session.createdByUserId === userId;
    const isAdmin = member && ADMIN_ROLES.includes(member.role);

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ error: 'Sem permissão para cancelar esta sessão.' });
    }

    // Devolver fichas a todos os jogadores
    for (const player of session.players) {
      if (player.fichaDeducted) {
        await prisma.user.update({
          where: { id: player.userId },
          data: { walletBalance: { increment: session.fichasPerPlayer } },
        });
        await prisma.walletTransaction.create({
          data: {
            userId: player.userId,
            amount: session.fichasPerPlayer,
            description: `Estorno: sessão "${session.title}" cancelada`,
            type: 'GAME_CANCEL_REFUND',
            referenceId: session.id,
          },
        });
      }
    }

    await prisma.gameSession.update({
      where: { id: parseInt(sessionId) },
      data: { status: 'CANCELLED' },
    });
    res.json({ message: 'Sessão cancelada e fichas estornadas.' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao cancelar sessão.' });
  }
};

export const finishSession = async (req, res) => {
  const { groupId, sessionId } = req.params;
  const userId = req.user.id;

  try {
    const member = await getGroupMember(parseInt(groupId), userId);
    if (!member || !ADMIN_ROLES.includes(member.role)) {
      return res.status(403).json({ error: 'Apenas admins podem finalizar sessões.' });
    }

    await prisma.gameSession.update({
      where: { id: parseInt(sessionId) },
      data: { status: 'FINISHED' },
    });
    res.json({ message: 'Sessão finalizada. Avaliações liberadas.' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao finalizar sessão.' });
  }
};

// ─── Entrar/Sair da Sessão ───────────────────────────────────────────────────

export const joinSession = async (req, res) => {
  const { groupId, sessionId } = req.params;
  const userId = req.user.id;
  const gId = parseInt(groupId);
  const sId = parseInt(sessionId);

  try {
    const session = await prisma.gameSession.findFirst({
      where: { id: sId, groupId: gId },
      include: { players: true },
    });
    if (!session) return res.status(404).json({ error: 'Sessão não encontrada.' });
    if (session.status !== 'OPEN') return res.status(400).json({ error: 'Esta sessão não está aberta para inscrições.' });

    // Verificar acesso: se GROUP_ONLY, deve ser membro
    if (session.visibility === 'GROUP_ONLY') {
      const member = await getGroupMember(gId, userId);
      if (!member) return res.status(403).json({ error: 'Apenas membros do grupo podem entrar nesta sessão.' });
    }

    const already = session.players.find((p) => p.userId === userId);
    if (already) return res.status(400).json({ error: 'Você já está inscrito nesta sessão.' });

    // Verificar saldo de fichas
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.walletBalance < session.fichasPerPlayer) {
      return res.status(400).json({ error: `Fichas insuficientes. Você precisa de ${session.fichasPerPlayer} ficha(s).` });
    }

    // Determinar posição (titular ou reserva)
    const starters = session.players.filter((p) => p.status === 'STARTER' || p.status === 'CONFIRMED').length;
    const isStarter = starters < session.maxStarters;

    if (!isStarter) {
      const reserves = session.players.filter((p) => p.status === 'RESERVE').length;
      if (reserves >= session.maxReserves) {
        return res.status(400).json({ error: 'Não há vagas de titular nem de reserva disponíveis.' });
      }
    }

    // Debitar ficha
    await prisma.user.update({
      where: { id: userId },
      data: { walletBalance: { decrement: session.fichasPerPlayer } },
    });
    await prisma.walletTransaction.create({
      data: {
        userId,
        amount: -session.fichasPerPlayer,
        description: `Inscrição: sessão "${session.title}"`,
        type: 'GAME_JOIN',
        referenceId: sId,
      },
    });

    const player = await prisma.gamePlayer.create({
      data: {
        gameSessionId: sId,
        userId,
        status: isStarter ? 'STARTER' : 'RESERVE',
        fichaDeducted: true,
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
    res.status(201).json(player);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao entrar na sessão.' });
  }
};

export const leaveSession = async (req, res) => {
  const { groupId, sessionId } = req.params;
  const userId = req.user.id;
  const sId = parseInt(sessionId);

  try {
    const session = await prisma.gameSession.findFirst({
      where: { id: sId, groupId: parseInt(groupId) },
    });
    if (!session) return res.status(404).json({ error: 'Sessão não encontrada.' });

    const player = await prisma.gamePlayer.findUnique({
      where: { gameSessionId_userId: { gameSessionId: sId, userId } },
    });
    if (!player) return res.status(404).json({ error: 'Você não está inscrito nesta sessão.' });

    // Verificar prazo de cancelamento
    const now = new Date();
    const sessionDate = new Date(session.date);
    const hoursUntilGame = (sessionDate - now) / (1000 * 60 * 60);
    const withinDeadline = hoursUntilGame >= session.cancelDeadlineHours;

    if (withinDeadline && player.fichaDeducted) {
      // Devolver ficha
      await prisma.user.update({
        where: { id: userId },
        data: { walletBalance: { increment: session.fichasPerPlayer } },
      });
      await prisma.walletTransaction.create({
        data: {
          userId,
          amount: session.fichasPerPlayer,
          description: `Cancelamento dentro do prazo: "${session.title}"`,
          type: 'GAME_CANCEL_REFUND',
          referenceId: sId,
        },
      });
    }

    const wasStarter = player.status === 'STARTER' || player.status === 'CONFIRMED';
    await prisma.gamePlayer.delete({ where: { id: player.id } });

    // Promover reserva automaticamente se era titular
    if (wasStarter && session.autoPromoteReserves) {
      const firstReserve = await prisma.gamePlayer.findFirst({
        where: { gameSessionId: sId, status: 'RESERVE' },
        orderBy: { joinedAt: 'asc' },
      });
      if (firstReserve) {
        await prisma.gamePlayer.update({
          where: { id: firstReserve.id },
          data: { status: 'PROMOTED' },
        });
      }
    }

    res.json({
      message: withinDeadline
        ? 'Você saiu da sessão. Ficha estornada.'
        : 'Você saiu da sessão. Ficha não estornada (fora do prazo de cancelamento).',
      fichaRefunded: withinDeadline && player.fichaDeducted,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao sair da sessão.' });
  }
};

export const confirmPresence = async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;
  const sId = parseInt(sessionId);

  try {
    const player = await prisma.gamePlayer.findUnique({
      where: { gameSessionId_userId: { gameSessionId: sId, userId } },
    });
    if (!player) return res.status(404).json({ error: 'Você não está inscrito nesta sessão.' });

    const updated = await prisma.gamePlayer.update({
      where: { id: player.id },
      data: { confirmedAt: new Date(), status: 'CONFIRMED' },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao confirmar presença.' });
  }
};

export const promoteReserve = async (req, res) => {
  const { groupId, sessionId, playerId } = req.params;
  const userId = req.user.id;

  try {
    const member = await getGroupMember(parseInt(groupId), userId);
    if (!member || !ADMIN_ROLES.includes(member.role)) {
      return res.status(403).json({ error: 'Apenas admins podem promover reservas.' });
    }

    const updated = await prisma.gamePlayer.update({
      where: { id: parseInt(playerId) },
      data: { status: 'PROMOTED' },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao promover reserva.' });
  }
};
