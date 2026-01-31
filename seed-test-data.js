import prisma from './src/config/prisma.js';
import bcrypt from 'bcrypt';

async function seedUsersWithCpf() {
  try {
    console.log('🌱 Criando usuários de teste com CPF e data de nascimento...');
    
    // Criar usuário Arena
    const arenaPassword = await bcrypt.hash('arena123', 10);
    const arenaUser = await prisma.user.create({
      data: {
        name: 'Arena Sport Connect',
        email: 'arena@sportconnect.com',
        password: arenaPassword,
        role: 'ARENA',
        cpf: '12345678901',
        dataNascimento: new Date('1990-01-15'),
        arena: {
          create: {
            nomeArena: 'Arena Sport Connect',
            cnpj: '12345678000195'
          }
        }
      }
    });
    console.log('✅ Arena criada com sucesso!');

    // Criar usuário Atleta
    const atletaPassword = await bcrypt.hash('atleta123', 10);
    const atletaUser = await prisma.user.create({
      data: {
        name: 'João Silva',
        email: 'atleta@sportconnect.com',
        password: atletaPassword,
        role: 'ATLETA',
        cpf: '98765432109',
        dataNascimento: new Date('1995-05-20'),
        atleta: {
          create: {
            apelido: 'Joãozinho',
            ranking: 1500,
            telefone: '11999999999',
            localizacao: 'São Paulo, SP'
          }
        }
      }
    });
    console.log('✅ Atleta criado com sucesso!');

    // Criar usuário Profissional
    const profissionalPassword = await bcrypt.hash('prof123', 10);
    const profissionalUser = await prisma.user.create({
      data: {
        name: 'Carlos Santos',
        email: 'profissional@sportconnect.com',
        password: profissionalPassword,
        role: 'PROFISSIONAL',
        cpf: '45678912300',
        dataNascimento: new Date('1985-08-10'),
        profissional: {
          create: {
            especialidade: 'Árbitro de Futebol',
            valorHora: 150.00
          }
        }
      }
    });
    console.log('✅ Profissional criado com sucesso!');

    console.log('🎉 Dados de teste criados com sucesso!');
    console.log('');
    console.log('📋 Usuários de teste:');
    console.log('- Arena: arena@sportconnect.com / senha: arena123');
    console.log('- Atleta: atleta@sportconnect.com / senha: atleta123');
    console.log('- Profissional: profissional@sportconnect.com / senha: prof123');
    console.log('');
    console.log('💡 Para testar a recuperação de senha, use:');
    console.log('- CPF: 123.456.789-01, Data: 15/01/1990, Email: arena@sportconnect.com');
    console.log('- CPF: 987.654.321-09, Data: 20/05/1995, Email: atleta@sportconnect.com');
    console.log('- CPF: 456.789.123-00, Data: 10/08/1985, Email: profissional@sportconnect.com');
    
  } catch (error) {
    console.error('❌ Erro ao criar dados de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsersWithCpf();