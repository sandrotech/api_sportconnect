import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedGroups() {
  try {
    // Obter data atual e próximos dias
    const today = new Date();
    const nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + (6 - today.getDay()) + 7); // Próximo sábado
    
    const nextSunday = new Date(nextSaturday);
    nextSunday.setDate(nextSaturday.getDate() + 1);
    
    const nextTuesday = new Date(today);
    nextTuesday.setDate(today.getDate() + (2 - today.getDay() + 7) % 7 + 7);
    
    const nextThursday = new Date(nextTuesday);
    nextThursday.setDate(nextTuesday.getDate() + 2);
    
    const nextWednesday = new Date(today);
    nextWednesday.setDate(today.getDate() + (3 - today.getDay() + 7) % 7 + 7);
    
    const nextFriday = new Date(nextWednesday);
    nextFriday.setDate(nextWednesday.getDate() + 2);
    
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + (1 - today.getDay() + 7) % 7 + 7);

    // Criar grupos de teste em Fortaleza
    const groups = [
      {
        name: 'Vôlei de Praia - Praia do Futuro',
        description: 'Grupo de vôlei de praia para jogadores de todos os níveis. Jogamos aos sábados e domingos.',
        city: 'Fortaleza',
        schedules: [
          { date: nextSaturday, location: 'Praia do Futuro', description: 'Jogo amistoso - Sábado' },
          { date: nextSunday, location: 'Praia do Futuro', description: 'Jogo amistoso - Domingo' }
        ]
      },
      {
        name: 'Beach Tennis - Praia de Iracema',
        description: 'Grupo dedicado ao beach tennis. Reuniões semanais para prática e competição.',
        city: 'Fortaleza',
        schedules: [
          { date: nextTuesday, location: 'Praia de Iracema', description: 'Treino de beach tennis' },
          { date: nextThursday, location: 'Praia de Iracema', description: 'Treino de beach tennis' }
        ]
      },
      {
        name: 'Futevôlei - Meireles',
        description: 'Grupo de futevôlei para jogadores experientes. Nível intermediário a avançado.',
        city: 'Fortaleza',
        schedules: [
          { date: nextWednesday, location: 'Praia do Meireles', description: 'Jogo de futevôlei' },
          { date: nextFriday, location: 'Praia do Meireles', description: 'Jogo de futevôlei' }
        ]
      },
      {
        name: 'Vôlei de Quadra - Centro',
        description: 'Grupo de vôlei de quadra para jogadores recreativos. Jogamos em quadras cobertas.',
        city: 'Fortaleza',
        schedules: [
          { date: nextMonday, location: 'Ginásio do Centro', description: 'Vôlei de quadra' },
          { date: nextWednesday, location: 'Ginásio do Centro', description: 'Vôlei de quadra' }
        ]
      }
    ];

    for (const groupData of groups) {
      const group = await prisma.group.create({
        data: {
          name: groupData.name,
          description: groupData.description,
          city: groupData.city,
          schedules: {
            create: groupData.schedules
          }
        }
      });

      console.log(`Grupo criado: ${group.name}`);
    }

    console.log('Grupos de teste criados com sucesso!');
  } catch (error) {
    console.error('Erro ao criar grupos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedGroups();