import arenaService from '../services/arena.service.js';

class ArenaController {
  async getMe(req, res) {
    try {
      const profile = await arenaService.getProfile(req.user.id);
      return res.json(profile);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  }
}

export default new ArenaController();
