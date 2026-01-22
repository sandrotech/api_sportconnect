import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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
}

export default new AuthService();
