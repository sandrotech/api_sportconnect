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
}

export default new ArenaController();
