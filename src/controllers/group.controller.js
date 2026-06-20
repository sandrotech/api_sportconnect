import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ADMIN_ROLES = ['OWNER', 'CO_OWNER'];

async function getMemberRole(groupId, userId) {
  return prisma.groupMember.findFirst({
    where: { groupId, userId, status: 'APPROVED' },
  });
}

async function requireAdmin(groupId, userId, res) {
  const member = await getMemberRole(groupId, userId);
  if (!member || !ADMIN_ROLES.includes(member.role)) {
    res.status(403).json({ error: 'Apenas administradores podem realizar esta ação.' });
    return null;
  }
  return member;
}

// ─── CRUD de Grupo ────────────────────────────────────────────────────────────

export const createGroup = async (req, res) => {
  const { name, description, city, sport, nivel, maxMembers, photo, visibility } = req.body;
  const userId = req.user.id;

  try {
    const newGroup = await prisma.group.create({
      data: {
        name,
        description,
        city,
        sport,
        nivel,
        maxMembers: maxMembers ? parseInt(maxMembers) : 20,
        photo,
        visibility: visibility || 'REQUEST_ONLY',
        members: {
          create: {
            userId,
            role: 'OWNER',
            status: 'APPROVED',
          },
        },
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      },
    });
    res.status(201).json(newGroup);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao criar grupo.' });
  }
};

export const getAllGroups = async (req, res) => {
  const { sport, city, visibility } = req.query;

  try {
    const where = {};
    if (sport) where.sport = { contains: sport, mode: 'insensitive' };
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (visibility) where.visibility = visibility;

    const groups = await prisma.group.findMany({
      where,
      include: {
        members: {
          where: { status: 'APPROVED' },
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar grupos.' });
  }
};

export const getMyGroups = async (req, res) => {
  const userId = req.user.id;

  try {
    const memberships = await prisma.groupMember.findMany({
      where: { userId, status: 'APPROVED' },
      include: {
        group: {
          include: {
            members: {
              where: { status: 'APPROVED' },
              include: { user: { select: { id: true, name: true, avatar: true } } },
            },
            gameSessions: {
              where: { status: { in: ['OPEN', 'CONFIRMED'] } },
              orderBy: { date: 'asc' },
              take: 3,
            },
            _count: { select: { members: true } },
          },
        },
      },
    });
    res.json(memberships.map((m) => ({ ...m.group, myRole: m.role })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar seus grupos.' });
  }
};

export const getGroupById = async (req, res) => {
  const { id } = req.params;

  try {
    const group = await prisma.group.findUnique({
      where: { id: parseInt(id) },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        gameSessions: {
          orderBy: { date: 'asc' },
          include: {
            arena: { select: { id: true, nomeArena: true } },
            players: { include: { user: { select: { id: true, name: true, avatar: true } } } },
          },
        },
      },
    });
    if (!group) return res.status(404).json({ error: 'Grupo não encontrado.' });
    res.json(group);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar grupo.' });
  }
};

export const updateGroup = async (req, res) => {
  const { id } = req.params;
  const { name, description, city, sport, nivel, maxMembers, photo, visibility } = req.body;
  const userId = req.user.id;

  try {
    const admin = await requireAdmin(parseInt(id), userId, res);
    if (!admin) return;

    const updatedGroup = await prisma.group.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(city && { city }),
        ...(sport && { sport }),
        ...(nivel !== undefined && { nivel }),
        ...(maxMembers && { maxMembers: parseInt(maxMembers) }),
        ...(photo !== undefined && { photo }),
        ...(visibility && { visibility }),
      },
    });
    res.json(updatedGroup);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao atualizar grupo.' });
  }
};

export const updateGroupPhoto = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const admin = await requireAdmin(parseInt(id), userId, res);
    if (!admin) return;

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    }

    const photoUrl = req.file.location || req.file.path;

    const updatedGroup = await prisma.group.update({
      where: { id: parseInt(id) },
      data: { photo: photoUrl },
    });
    
    res.json(updatedGroup);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao atualizar foto do grupo.' });
  }
};

export const deleteGroup = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const member = await getMemberRole(parseInt(id), userId);
    if (!member || member.role !== 'OWNER') {
      return res.status(403).json({ error: 'Apenas o dono pode excluir o grupo.' });
    }

    await prisma.group.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao excluir grupo.' });
  }
};

// ─── Gerenciamento de Membros ────────────────────────────────────────────────

export const joinGroupRequest = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const groupId = parseInt(id);

  try {
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) return res.status(404).json({ error: 'Grupo não encontrado.' });

    if (group.visibility === 'PRIVATE') {
      return res.status(403).json({ error: 'Este grupo é privado. Entre por link de convite.' });
    }

    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (existing) {
      return res.status(400).json({ error: 'Você já faz parte ou tem uma solicitação pendente neste grupo.' });
    }

    // Verificar limite de membros
    const approvedCount = await prisma.groupMember.count({
      where: { groupId, status: 'APPROVED' },
    });
    if (approvedCount >= group.maxMembers) {
      return res.status(400).json({ error: 'O grupo atingiu o limite máximo de membros.' });
    }

    const isPublic = group.visibility === 'PUBLIC';
    const newMember = await prisma.groupMember.create({
      data: {
        groupId,
        userId,
        role: 'MEMBER',
        status: isPublic ? 'APPROVED' : 'PENDING',
      },
    });
    res.status(201).json(newMember);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao solicitar entrada no grupo.' });
  }
};

export const getPendingRequests = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const groupId = parseInt(id);

  try {
    const admin = await requireAdmin(groupId, userId, res);
    if (!admin) return;

    const pending = await prisma.groupMember.findMany({
      where: { groupId, status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
            atleta: {
              select: {
                apelido: true,
                ranking: true,
                telefone: true,
                localizacao: true,
                esportes: true,
                nivel: true
              }
            }
          }
        }
      },
      orderBy: { joinedAt: 'asc' },
    });
    res.json(pending);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar solicitações.' });
  }
};

export const approveJoinRequest = async (req, res) => {
  const { id, memberId } = req.params;
  const userId = req.user.id;
  const groupId = parseInt(id);

  try {
    const admin = await requireAdmin(groupId, userId, res);
    if (!admin) return;

    // Verificar limite de membros
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    const approvedCount = await prisma.groupMember.count({
      where: { groupId, status: 'APPROVED' },
    });
    if (approvedCount >= group.maxMembers) {
      return res.status(400).json({ error: 'O grupo atingiu o limite máximo de membros.' });
    }

    const updated = await prisma.groupMember.update({
      where: { id: parseInt(memberId) },
      data: { status: 'APPROVED', role: 'MEMBER' },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao aprovar solicitação.' });
  }
};

export const rejectJoinRequest = async (req, res) => {
  const { id, memberId } = req.params;
  const userId = req.user.id;

  try {
    const admin = await requireAdmin(parseInt(id), userId, res);
    if (!admin) return;

    const updated = await prisma.groupMember.update({
      where: { id: parseInt(memberId) },
      data: { status: 'REJECTED' },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao rejeitar solicitação.' });
  }
};

export const promoteMember = async (req, res) => {
  const { id, memberId } = req.params;
  const { role } = req.body; // CO_OWNER ou MEMBER
  const userId = req.user.id;
  const groupId = parseInt(id);

  try {
    const member = await getMemberRole(groupId, userId);
    if (!member || member.role !== 'OWNER') {
      return res.status(403).json({ error: 'Apenas o dono pode alterar papéis de membros.' });
    }

    const validRoles = ['CO_OWNER', 'MEMBER'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Papel inválido.' });
    }

    const updated = await prisma.groupMember.update({
      where: { id: parseInt(memberId) },
      data: { role },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao alterar papel do membro.' });
  }
};

export const leaveGroup = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const groupId = parseInt(id);

  try {
    const member = await getMemberRole(groupId, userId);
    if (member?.role === 'OWNER') {
      return res.status(400).json({ error: 'O dono não pode sair do grupo. Transfira a propriedade ou exclua o grupo.' });
    }

    await prisma.groupMember.deleteMany({ where: { groupId, userId } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao sair do grupo.' });
  }
};

export const removeMember = async (req, res) => {
  const { id, memberId } = req.params;
  const userId = req.user.id;

  try {
    const admin = await requireAdmin(parseInt(id), userId, res);
    if (!admin) return;

    await prisma.groupMember.delete({ where: { id: parseInt(memberId) } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao remover membro.' });
  }
};

export const banMember = async (req, res) => {
  const { id, memberId } = req.params;
  const userId = req.user.id;

  try {
    const admin = await requireAdmin(parseInt(id), userId, res);
    if (!admin) return;

    const memberToBan = await prisma.groupMember.findUnique({
      where: { id: parseInt(memberId) },
    });
    if (!memberToBan) {
      return res.status(404).json({ error: 'Membro não encontrado.' });
    }

    if (memberToBan.role === 'OWNER') {
      return res.status(403).json({ error: 'Não é possível banir o dono do grupo.' });
    }

    const updated = await prisma.groupMember.update({
      where: { id: parseInt(memberId) },
      data: { status: 'BANNED' },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao banir membro.' });
  }
};

export const getMembers = async (req, res) => {
  const { id } = req.params;

  try {
    const members = await prisma.groupMember.findMany({
      where: { groupId: parseInt(id), status: 'APPROVED' },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { joinedAt: 'asc' },
    });
    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar membros.' });
  }
};

// ─── Convite por Link ─────────────────────────────────────────────────────────

export const generateInviteLink = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const groupId = parseInt(id);

  try {
    const admin = await requireAdmin(groupId, userId, res);
    if (!admin) return;

    const token = crypto.randomBytes(16).toString('hex');
    const group = await prisma.group.update({
      where: { id: groupId },
      data: { inviteToken: token },
    });
    res.json({ inviteToken: group.inviteToken });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao gerar link de convite.' });
  }
};

export const joinByInvite = async (req, res) => {
  const { token } = req.params;
  const userId = req.user.id;

  try {
    const group = await prisma.group.findUnique({ where: { inviteToken: token } });
    if (!group) return res.status(404).json({ error: 'Link de convite inválido ou expirado.' });

    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: group.id, userId } },
    });
    if (existing) {
      return res.status(400).json({ error: 'Você já faz parte deste grupo.' });
    }

    const approvedCount = await prisma.groupMember.count({
      where: { groupId: group.id, status: 'APPROVED' },
    });
    if (approvedCount >= group.maxMembers) {
      return res.status(400).json({ error: 'O grupo atingiu o limite máximo de membros.' });
    }

    const newMember = await prisma.groupMember.create({
      data: { groupId: group.id, userId, role: 'MEMBER', status: 'APPROVED' },
    });
    res.status(201).json({ group, member: newMember });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao entrar no grupo por convite.' });
  }
};
