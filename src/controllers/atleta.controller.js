import atletaService from '../services/atleta.service.js';

class AtletaController {
  async getMe(req, res) {
    try {
      const profile = await atletaService.getProfile(req.user.id);
      return res.json(profile);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  }

  async updateMe(req, res) {
    try {
      const data = { ...req.body };
      if (req.file) {
        data.avatar = `uploads/${req.file.filename}`;
      }
      
      const profile = await atletaService.updateProfile(req.user.id, data);
      return res.json(profile);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export default new AtletaController();
