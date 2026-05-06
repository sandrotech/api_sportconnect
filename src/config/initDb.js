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
      console.log('🚀 Criando usuário Administrador Master padrão...');
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
            },
          },
        },
      });
      console.log('✅ Administrador Master criado com sucesso!');
    } else {
      console.log('ℹ️ Usuário administrador master já está cadastrado.');
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar administrador master:', error);
  }
}
