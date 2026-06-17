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
      if (req.files) {
        if (req.files.avatar) data.avatar = req.files.avatar[0].location || `uploads/${req.files.avatar[0].filename}`;
        if (req.files.banner) data.banner = req.files.banner[0].location || `uploads/${req.files.banner[0].filename}`;
      }
      
      const profile = await atletaService.updateProfile(req.user.id, data);
      return res.json(profile);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getByCpf(req, res) {
    try {
      const atleta = await atletaService.getByCpf(req.params.cpf);
      return res.json(atleta);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  }
}

export default new AtletaController();
