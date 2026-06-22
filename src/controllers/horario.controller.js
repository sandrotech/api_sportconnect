import horarioService from '../services/horario.service.js';

class HorarioController {
  async getByQuadra(req, res) {
    try {
      const slots = await horarioService.getByQuadra(req.params.quadraId);
      return res.json(slots);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async upsertSlot(req, res) {
    try {
      const slot = await horarioService.upsertSlot(req.user.id, req.body);
      return res.json(slot);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async saveLote(req, res) {
    try {
      const { slots } = req.body;
      const result = await horarioService.saveLote(req.user.id, slots);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async deleteSlot(req, res) {
    try {
      const force = req.query.force === 'true';
      await horarioService.deleteSlot(req.params.id, req.user.id, force);
      return res.json({ message: 'Slot removido' });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getPublico(req, res) {
    try {
      const slots = await horarioService.getPublico(req.params.arenaId);
      return res.json(slots);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export default new HorarioController();
