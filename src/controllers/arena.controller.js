import arenaService from '../services/arena.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class ArenaController {
  async getMe(req, res) {
    try {
      const profile = await arenaService.getProfile(req.user.id);
      return res.json(profile);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const arenas = await prisma.arena.findMany({
        where: { status: 'APPROVED' },
        include: { user: { select: { id: true, name: true } } },
      });
      return res.json(arenas);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar arenas.' });
    }
  }
  async getDashboard(req, res) {
    try {
      const arena = await prisma.arena.findUnique({
        where: { userId: req.user.id },
        include: { quadras: { where: { ativa: true } } }
      });
      if (!arena) return res.status(404).json({ error: 'Arena não encontrada' });

      const agora = new Date();
      const inicioDia = new Date(agora); inicioDia.setHours(0, 0, 0, 0);
      const fimDia = new Date(agora); fimDia.setHours(23, 59, 59, 999);
      const inicioSemana = new Date(agora); inicioSemana.setDate(agora.getDate() - 6); inicioSemana.setHours(0, 0, 0, 0);
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

      const quadraIds = arena.quadras.map(q => q.id);

      const [reservasPendentes, reservasSemana, reservasMes, ultimasReservas, totalHorarios] = await Promise.all([
        prisma.reserva.count({ where: { quadraId: { in: quadraIds }, status: 'PENDENTE' } }),
        prisma.reserva.count({ where: { quadraId: { in: quadraIds }, data: { gte: inicioSemana }, status: { in: ['PENDENTE', 'CONFIRMADA'] } } }),
        prisma.reserva.findMany({ where: { quadraId: { in: quadraIds }, data: { gte: inicioMes }, status: 'CONFIRMADA' }, select: { valorPago: true } }),
        prisma.reserva.findMany({
          where: { quadraId: { in: quadraIds } },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            quadra: { select: { nome: true, esporte: true } },
            atletaUser: { select: { id: true, name: true, avatar: true } }
          }
        }),
        prisma.horarioSlot.count({ where: { quadraId: { in: quadraIds }, disponivel: true } }),
      ]);

      const faturamentoMes = reservasMes.reduce((acc, r) => acc + Number(r.valorPago || 0), 0);

      return res.json({
        totalQuadras: arena.quadras.length,
        totalHorariosDisponiveis: totalHorarios,
        reservasPendentes,
        reservasSemana,
        faturamentoMes,
        ultimasReservas,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao carregar dashboard' });
    }
  }
}

export default new ArenaController();
