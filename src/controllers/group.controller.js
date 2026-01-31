import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createGroup = async (req, res) => {
  const { name, description, city } = req.body;
  const userId = req.user.id;

  try {
    const newGroup = await prisma.group.create({
      data: {
        name,
        description,
        city,
        members: {
          create: {
            userId: userId,
            role: 'ADMIN',
            status: 'APPROVED',
          },
        },
      },
      include: {
        members: true,
      },
    });
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar grupo.' });
  }
};

export const getAllGroups = async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        schedules: {
          orderBy: {
            date: 'asc'
          }
        },
        _count: {
          select: { members: true },
        },
      },
    });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar grupos.' });
  }
};

export const getGroupById = async (req, res) => {
  const { id } = req.params;
  try {
    const group = await prisma.group.findUnique({
      where: { id: parseInt(id) },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                apelido: true,
                avatar: true,
              },
            },
          },
        },
        schedules: true,
      },
    });
    if (!group) {
      return res.status(404).json({ error: 'Grupo não encontrado.' });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar grupo.' });
  }
};

export const updateGroup = async (req, res) => {
  const { id } = req.params;
  const { name, description, city } = req.body;
  const userId = req.user.id;

  try {
    const member = await prisma.groupMember.findFirst({
      where: {
        groupId: parseInt(id),
        userId: userId,
        role: 'ADMIN',
      },
    });

    if (!member) {
      return res.status(403).json({ error: 'Apenas administradores podem editar o grupo.' });
    }

    const updatedGroup = await prisma.group.update({
      where: { id: parseInt(id) },
      data: { name, description, city },
    });
    res.json(updatedGroup);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar grupo.' });
  }
};

export const deleteGroup = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const member = await prisma.groupMember.findFirst({
      where: {
        groupId: parseInt(id),
        userId: userId,
        role: 'ADMIN',
      },
    });

    if (!member) {
      return res.status(403).json({ error: 'Apenas administradores podem excluir o grupo.' });
    }
    
    // Deletar membros e agendamentos primeiro
    await prisma.groupMember.deleteMany({ where: { groupId: parseInt(id) } });
    await prisma.gameSchedule.deleteMany({ where: { groupId: parseInt(id) } });


    await prisma.group.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Erro ao excluir grupo.' });
  }
};

export const joinGroupRequest = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const existingMember = await prisma.groupMember.findFirst({
      where: {
        groupId: parseInt(id),
        userId: userId,
      },
    });

    if (existingMember) {
      return res.status(400).json({ error: 'Você já é membro ou tem uma solicitação pendente.' });
    }

    const newMember = await prisma.groupMember.create({
      data: {
        groupId: parseInt(id),
        userId: userId,
        role: 'MEMBER',
        status: 'PENDING',
      },
    });
    res.status(201).json(newMember);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao solicitar entrada no grupo.' });
  }
};

export const approveJoinRequest = async (req, res) => {
  const { id, memberId } = req.params;
  const adminId = req.user.id;

  try {
    const admin = await prisma.groupMember.findFirst({
      where: {
        groupId: parseInt(id),
        userId: adminId,
        role: 'ADMIN',
      },
    });

    if (!admin) {
      return res.status(403).json({ error: 'Apenas administradores podem aprovar solicitações.' });
    }

    const updatedMember = await prisma.groupMember.update({
      where: { id: parseInt(memberId) },
      data: { status: 'APPROVED' },
    });
    res.json(updatedMember);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao aprovar solicitação.' });
  }
};

export const leaveGroup = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    await prisma.groupMember.deleteMany({
      where: {
        groupId: parseInt(id),
        userId: userId,
      },
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Erro ao sair do grupo.' });
  }
};

export const removeMember = async (req, res) => {
  const { id, memberId } = req.params;
  const adminId = req.user.id;

  try {
    const admin = await prisma.groupMember.findFirst({
      where: {
        groupId: parseInt(id),
        userId: adminId,
        role: 'ADMIN',
      },
    });

    if (!admin) {
      return res.status(403).json({ error: 'Apenas administradores podem remover membros.' });
    }

    await prisma.groupMember.delete({
      where: { id: parseInt(memberId) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Erro ao remover membro.' });
  }
};
