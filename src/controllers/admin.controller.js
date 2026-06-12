import adminService from '../services/admin.service.js';

class AdminController {
  // ─── Dashboard ───────────────────────────────────────────────────────────────

  async getDashboard(req, res) {
    try {
      const stats = await adminService.getDashboardStats();
      return res.json(stats);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ─── Atletas ─────────────────────────────────────────────────────────────────

  async getAtletas(req, res) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const result = await adminService.getAtletas({ page: Number(page), limit: Number(limit), search });
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getAtleta(req, res) {
    try {
      const data = await adminService.getAtleta(req.params.id);
      return res.json(data);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  }

  async updateAtleta(req, res) {
    try {
      const data = await adminService.updateAtleta(req.params.id, req.body);
      return res.json(data);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async deleteAtleta(req, res) {
    try {
      const result = await adminService.deleteAtleta(req.params.id);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // ─── Arenas ──────────────────────────────────────────────────────────────────

  async getArenas(req, res) {
    try {
      const { page = 1, limit = 20, search = '', status = '' } = req.query;
      const result = await adminService.getArenas({ page: Number(page), limit: Number(limit), search, status });
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getArena(req, res) {
    try {
      const data = await adminService.getArena(req.params.id);
      return res.json(data);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  }

  async updateArena(req, res) {
    try {
      const data = await adminService.updateArena(req.params.id, req.body);
      return res.json(data);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async aprovarArena(req, res) {
    try {
      const data = await adminService.updateArenaStatus(req.params.id, 'APPROVED');
      return res.json(data);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async rejeitarArena(req, res) {
    try {
      const data = await adminService.updateArenaStatus(req.params.id, 'REJECTED');
      return res.json(data);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async deleteArena(req, res) {
    try {
      const result = await adminService.deleteArena(req.params.id);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // ─── Profissionais ───────────────────────────────────────────────────────────

  async getProfissionais(req, res) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const result = await adminService.getProfissionais({ page: Number(page), limit: Number(limit), search });
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getProfissional(req, res) {
    try {
      const data = await adminService.getProfissional(req.params.id);
      return res.json(data);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  }

  async updateProfissional(req, res) {
    try {
      const data = await adminService.updateProfissional(req.params.id, req.body);
      return res.json(data);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async deleteProfissional(req, res) {
    try {
      const result = await adminService.deleteProfissional(req.params.id);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export default new AdminController();
