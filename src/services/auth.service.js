import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/prisma.js';

class AuthService {
  async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Senha incorreta');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token };
  }

  async registerArena({ name, email, password, nomeArena, cnpj }) {
    await this._checkEmail(email);
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ARENA',
        arena: {
          create: {
            nomeArena,
            cnpj,
          },
        },
      },
      include: { arena: true },
    });

    return user;
  }

  async registerAtleta({ name, email, password, apelido }) {
    await this._checkEmail(email);
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ATLETA',
        atleta: {
          create: {
            apelido,
            ranking: 0,
          },
        },
      },
      include: { atleta: true },
    });

    return user;
  }

  async registerProfissional({ name, email, password, especialidade, valorHora }) {
    await this._checkEmail(email);
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'PROFISSIONAL',
        profissional: {
          create: {
            especialidade,
            valorHora,
          },
        },
      },
      include: { profissional: true },
    });

    return user;
  }

  async _checkEmail(email) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Email já cadastrado');
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new Error('Senha atual incorreta');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async forgotPassword(email) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hora

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });

    // Simulação de envio de e-mail
    console.log(`Reset token for ${email}: ${token}`);
    
    return { message: 'E-mail de recuperação enviado com sucesso', token }; // Retornando o token para facilitar o teste no front
  }

  async resetPassword(token, newPassword) {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new Error('Token inválido ou expirado');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
  }
}

export default new AuthService();
