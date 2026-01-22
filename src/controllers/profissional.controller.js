import profissionalService from '../services/profissional.service.js';

class ProfissionalController {
  async getMe(req, res) {
    try {
      const profile = await profissionalService.getProfile(req.user.id);
      return res.json(profile);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  }
}

export default new ProfissionalController();
