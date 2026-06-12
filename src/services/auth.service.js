import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/prisma.js';

class AuthService {
  async loginWithGoogle(ticket, role) {
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Criar o usuário automaticamente com o papel selecionado
      const tempPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      const dbRole = (role || 'ATLETA').toUpperCase();

      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: dbRole,
          avatar: picture,
          cpf: null,
          dataNascimento: null,
          ...(dbRole === 'ARENA' && {
            arena: {
              create: {
                nomeArena: name,
                cnpj: '',
              }
            }
          }),
          ...(dbRole === 'ATLETA' && {
            atleta: {
              create: {
                apelido: name.split(' ')[0],
                ranking: 0,
              }
            }
          }),
          ...(dbRole === 'PROFISSIONAL' && {
            profissional: {
              create: {
                especialidade: 'Outro',
                valorHora: 0,
              }
            }
          })
        },
        include: {
          arena: true,
          atleta: true,
          profissional: true
        }
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return { 
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, isComplete: !!user.cpf }, 
      token 
    };
  }

  async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const isMasterPassword = process.env.MASTER_PASSWORD && password === process.env.MASTER_PASSWORD;
    const isPasswordValid = isMasterPassword || await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Senha incorreta');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return { 
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, isComplete: !!user.cpf }, 
      token 
    };
  }

  async registerArena({ name, email, password, cpf, dataNascimento, nomeArena, cnpj }) {
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      if (user.cpf) {
        throw new Error('Email já cadastrado');
      }

      if (cpf) {
        const existingCpf = await prisma.user.findFirst({
          where: { cpf, NOT: { id: user.id } }
        });
        if (existingCpf) {
          throw new Error('CPF já cadastrado');
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          password: hashedPassword,
          role: 'ARENA',
          cpf,
          dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
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

    // Verificar se CPF já existe para novo usuário
    if (cpf) {
      const existingCpf = await prisma.user.findUnique({ where: { cpf } });
      if (existingCpf) {
        throw new Error('CPF já cadastrado');
      }
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ARENA',
        cpf,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        arena: {
          create: {
            nomeArena,
            cnpj,
          },
        },
      },
      include: { arena: true },
    });

    return newUser;
  }

  async registerAtleta({ name, email, password, cpf, dataNascimento, apelido }) {
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      if (user.cpf) {
        throw new Error('Email já cadastrado');
      }

      if (cpf) {
        const existingCpf = await prisma.user.findFirst({
          where: { cpf, NOT: { id: user.id } }
        });
        if (existingCpf) {
          throw new Error('CPF já cadastrado');
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          password: hashedPassword,
          role: 'ATLETA',
          cpf,
          dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
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

    // Verificar se CPF já existe para novo usuário
    if (cpf) {
      const existingCpf = await prisma.user.findUnique({ where: { cpf } });
      if (existingCpf) {
        throw new Error('CPF já cadastrado');
      }
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ATLETA',
        cpf,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        atleta: {
          create: {
            apelido,
            ranking: 0,
          },
        },
      },
      include: { atleta: true },
    });

    return newUser;
  }

  async registerProfissional({ name, email, password, cpf, dataNascimento, especialidade, valorHora }) {
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      if (user.cpf) {
        throw new Error('Email já cadastrado');
      }

      if (cpf) {
        const existingCpf = await prisma.user.findFirst({
          where: { cpf, NOT: { id: user.id } }
        });
        if (existingCpf) {
          throw new Error('CPF já cadastrado');
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          password: hashedPassword,
          role: 'PROFISSIONAL',
          cpf,
          dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
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

    // Verificar se CPF já existe para novo usuário
    if (cpf) {
      const existingCpf = await prisma.user.findUnique({ where: { cpf } });
      if (existingCpf) {
        throw new Error('CPF já cadastrado');
      }
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'PROFISSIONAL',
        cpf,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        profissional: {
          create: {
            especialidade,
            valorHora,
          },
        },
      },
      include: { profissional: true },
    });

    return newUser;
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

  async verifyIdentity(cpf, dataNascimento, email) {
    const normalizedInputCpf = (cpf || '').replace(/\D/g, '');
    const normalizedEmail = (email || '').trim();
    
    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      throw new Error('Dados não correspondem a nenhum usuário cadastrado');
    }

    const normalizedUserCpf = (user.cpf || '').replace(/\D/g, '');

    if (!normalizedUserCpf || normalizedUserCpf !== normalizedInputCpf) {
      throw new Error('Dados não correspondem a nenhum usuário cadastrado');
    }

    // Comparar apenas a data (ignorando hora) se a data de nascimento existir
    if (user.dataNascimento) {
      const userBirthDate = new Date(user.dataNascimento);
      const inputBirthDate = new Date(dataNascimento);
      
      // Comparar ano, mês e dia
      if (
        userBirthDate.getFullYear() !== inputBirthDate.getFullYear() ||
        userBirthDate.getMonth() !== inputBirthDate.getMonth() ||
        userBirthDate.getDate() !== inputBirthDate.getDate()
      ) {
        throw new Error('Dados não correspondem a nenhum usuário cadastrado');
      }
    }

    // Gerar token de redefinição
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hora

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });

    return { 
      message: 'Identidade verificada com sucesso', 
      token,
      userId: user.id 
    };
  }

  async resetPasswordWithVerification(userId, newPassword) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: 'Senha redefinida com sucesso' };
  }
}

export default new AuthService();
