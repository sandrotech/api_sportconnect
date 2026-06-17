import quadraService from '../services/quadra.service.js';

class QuadraController {
  async getMinhas(req, res) {
    try {
      const quadras = await quadraService.getMinhas(req.user.id);
      return res.json(quadras);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getByArenaId(req, res) {
    try {
      const quadras = await quadraService.getByArenaId(req.params.arenaId);
      return res.json(quadras);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async create(req, res) {
    try {
      const quadra = await quadraService.create(req.user.id, req.body);
      return res.status(201).json(quadra);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const quadra = await quadraService.update(req.params.id, req.user.id, req.body);
      return res.json(quadra);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async remove(req, res) {
    try {
      await quadraService.remove(req.params.id, req.user.id);
      return res.json({ message: 'Quadra removida' });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export default new QuadraController();
