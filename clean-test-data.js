import prisma from './src/config/prisma.js';

async function cleanTestData() {
  try {
    console.log('Limpando dados de teste...');
    
    // Deletar todos os dados relacionados primeiro
    await prisma.groupMember.deleteMany({});
    await prisma.gameSchedule.deleteMany({});
    await prisma.group.deleteMany({});
    await prisma.arena.deleteMany({});
    await prisma.atleta.deleteMany({});
    await prisma.profissional.deleteMany({});
    
    // Depois deletar os usuários
    const deletedUsers = await prisma.user.deleteMany({});
    
    console.log(`✅ ${deletedUsers.count} usuários deletados com sucesso!`);
    console.log('✅ Dados de teste limpos com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao limpar dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanTestData();