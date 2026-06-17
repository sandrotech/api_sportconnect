import reservaService from '../services/reserva.service.js';

class ReservaController {
  async criar(req, res) {
    try {
      const reserva = await reservaService.criar(req.user.id, req.body);
      return res.status(201).json(reserva);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async criarManual(req, res) {
    try {
      const reserva = await reservaService.criarManual(req.user.id, req.body);
      return res.status(201).json(reserva);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async minhas(req, res) {
    try {
      const reservas = await reservaService.minhas(req.user.id);
      return res.json(reservas);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async daArena(req, res) {
    try {
      const reservas = await reservaService.daArena(req.user.id);
      return res.json(reservas);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async atualizarStatus(req, res) {
    try {
      const reserva = await reservaService.atualizarStatus(req.params.id, req.user.id, req.body.status);
      return res.json(reserva);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export default new ReservaController();
