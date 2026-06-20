import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getBalance = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true },
    });
    res.json({ balance: user.walletBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar saldo.' });
  }
};

export const getTransactions = async (req, res) => {
  const userId = req.user.id;
  const { limit = 20, offset = 0 } = req.query;

  try {
    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.walletTransaction.count({ where: { userId } }),
    ]);
    res.json({ transactions, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar transações.' });
  }
};
export const getPackages = async (req, res) => {
  try {
    const packages = await prisma.tokenPackage.findMany({
      orderBy: { tokens: 'asc' },
    });
    res.json(packages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar pacotes de fichas.' });
  }
};

// Stub para compra de fichas (integração futura com gateway de pagamento)
export const purchaseFichas = async (req, res) => {
  const userId = req.user.id;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Quantidade de fichas inválida.' });
  }

  try {
    const [user] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { walletBalance: { increment: parseInt(amount) } },
      }),
      prisma.walletTransaction.create({
        data: {
          userId,
          amount: parseInt(amount),
          description: `Compra de ${amount} ficha(s)`,
          type: 'PURCHASE',
        },
      }),
    ]);
    res.json({ message: `${amount} ficha(s) adicionada(s) com sucesso.`, newBalance: user.walletBalance });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao processar compra.' });
  }
};
