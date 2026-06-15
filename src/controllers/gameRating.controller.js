import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const submitRatings = async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;
  const { ratings } = req.body; // [{ toUserId, score, comment }]

  if (!Array.isArray(ratings) || ratings.length === 0) {
    return res.status(400).json({ error: 'Forneça ao menos uma avaliação.' });
  }

  try {
    const session = await prisma.gameSession.findUnique({
      where: { id: parseInt(sessionId) },
      include: { players: true },
    });

    if (!session) return res.status(404).json({ error: 'Sessão não encontrada.' });
    if (session.status !== 'FINISHED') {
      return res.status(400).json({ error: 'Avaliações só são liberadas após o jogo ser finalizado.' });
    }

    // Verificar se o avaliador confirmou presença
    const myPlayer = session.players.find((p) => p.userId === userId && p.confirmedAt !== null);
    if (!myPlayer) {
      return res.status(403).json({ error: 'Apenas jogadores que confirmaram presença podem avaliar.' });
    }

    // Criar avaliações
    const created = [];
    for (const { toUserId, score, comment } of ratings) {
      if (toUserId === userId) continue; // Não pode se avaliar

      if (score < 1 || score > 5) {
        return res.status(400).json({ error: `Nota inválida para userId ${toUserId}. Use valores de 1 a 5.` });
      }

      const existing = await prisma.gameRating.findUnique({
        where: {
          gameSessionId_fromUserId_toUserId: {
            gameSessionId: parseInt(sessionId),
            fromUserId: userId,
            toUserId: parseInt(toUserId),
          },
        },
      });
      if (existing) continue; // Já avaliou este jogador

      const rating = await prisma.gameRating.create({
        data: {
          gameSessionId: parseInt(sessionId),
          fromUserId: userId,
          toUserId: parseInt(toUserId),
          score: parseInt(score),
          comment: comment || null,
        },
      });
      created.push(rating);

      // Atualizar ranking do atleta avaliado
      const avgResult = await prisma.gameRating.aggregate({
        where: { toUserId: parseInt(toUserId) },
        _avg: { score: true },
        _count: true,
      });
      const newRanking = Math.round((avgResult._avg.score || 0) * 100);
      await prisma.atleta.updateMany({
        where: { userId: parseInt(toUserId) },
        data: { ranking: newRanking },
      });
    }

    res.status(201).json({ created, message: `${created.length} avaliação(ões) registrada(s).` });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao registrar avaliações.' });
  }
};

export const getRatingStatus = async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;
  const sId = parseInt(sessionId);

  try {
    const session = await prisma.gameSession.findUnique({
      where: { id: sId },
      include: {
        players: { where: { confirmedAt: { not: null } } },
        ratings: { where: { fromUserId: userId } },
      },
    });
    if (!session) return res.status(404).json({ error: 'Sessão não encontrada.' });

    const rateableCount = session.players.filter((p) => p.userId !== userId).length;
    const ratedCount = session.ratings.length;
    const completed = ratedCount >= rateableCount;

    res.json({
      rateableCount,
      ratedCount,
      completed,
      pending: session.players
        .filter((p) => p.userId !== userId && !session.ratings.find((r) => r.toUserId === p.userId))
        .map((p) => p.userId),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao verificar status de avaliação.' });
  }
};

export const getSessionRatings = async (req, res) => {
  const { sessionId } = req.params;

  try {
    const ratings = await prisma.gameRating.findMany({
      where: { gameSessionId: parseInt(sessionId) },
      include: {
        fromUser: { select: { id: true, name: true, avatar: true } },
        toUser: { select: { id: true, name: true, avatar: true } },
      },
    });
    res.json(ratings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar avaliações.' });
  }
};
