import authService from '../services/auth.service.js';
import { OAuth2Client } from 'google-auth-library';

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const data = await authService.login(email, password);
      return res.json(data);
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  }

  async loginWithGoogle(req, res) {
    try {
      const { credential, role } = req.body;
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const data = await authService.loginWithGoogle(ticket, role);
      return res.json(data);
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  }

  async registerArena(req, res) {
    try {
      const user = await authService.registerArena(req.body);
      return res.status(201).json(user);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async registerAtleta(req, res) {
    try {
      const user = await authService.registerAtleta(req.body);
      return res.status(201).json(user);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async registerProfissional(req, res) {
    try {
      const user = await authService.registerProfissional(req.body);
      return res.status(201).json(user);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user.id, currentPassword, newPassword);
      return res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      return res.json({ message: 'Senha redefinida com sucesso' });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async verifyIdentity(req, res) {
    try {
      const { cpf, dataNascimento, email } = req.body;
      const result = await authService.verifyIdentity(cpf, dataNascimento, email);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async resetPasswordWithVerification(req, res) {
    try {
      const { userId, newPassword } = req.body;
      const result = await authService.resetPasswordWithVerification(userId, newPassword);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export default new AuthController();
