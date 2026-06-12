import bcrypt from 'bcrypt';
import prisma from './prisma.js';

export async function initializeAdmin() {
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL;
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('⚠️ Credenciais de Admin padrão não configuradas no .env');
    return;
  }

  try {
    const adminExists = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!adminExists) {
      console.log('🚀 Criando usuário Administrador Master padrão com todas as relações...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      await prisma.user.create({
        data: {
          name: 'SportConnect Admin Master',
          email: adminEmail,
          password: hashedPassword,
          role: 'ARENA',
          cpf: '00000000000',
          dataNascimento: new Date('1990-01-01'),
          arena: {
            create: {
              nomeArena: 'SportConnect Sede',
              cnpj: '00000000000000',
              status: 'APPROVED',
            },
          },
          atleta: {
            create: {
              apelido: 'AdminMaster',
              ranking: 100,
            },
          },
          profissional: {
            create: {
              especialidade: 'Administrador Geral',
              valorHora: 150.00,
            },
          },
        },
      });
      console.log('✅ Administrador Master criado com sucesso!');
    } else {
      console.log('ℹ️ Usuário administrador master já está cadastrado. Garantindo relações...');
      
      // Garantir que a relação Arena existe
      const arenaExists = await prisma.arena.findUnique({ where: { userId: adminExists.id } });
      if (!arenaExists) {
        await prisma.arena.create({
          data: {
            userId: adminExists.id,
            nomeArena: 'SportConnect Sede',
            cnpj: '00000000000000',
          },
        });
      }

      // Garantir que a relação Atleta existe
      const atletaExists = await prisma.atleta.findUnique({ where: { userId: adminExists.id } });
      if (!atletaExists) {
        await prisma.atleta.create({
          data: {
            userId: adminExists.id,
            apelido: 'AdminMaster',
            ranking: 100,
          },
        });
      }

      // Garantir que a relação Profissional existe
      const profissionalExists = await prisma.profissional.findUnique({ where: { userId: adminExists.id } });
      if (!profissionalExists) {
        await prisma.profissional.create({
          data: {
            userId: adminExists.id,
            especialidade: 'Administrador Geral',
            valorHora: 150.00,
          },
        });
      }
      console.log('✅ Relações do Administrador Master verificadas e garantidas!');
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar administrador master:', error);
  }
}
