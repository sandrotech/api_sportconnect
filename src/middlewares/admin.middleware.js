const adminMiddleware = (req, res, next) => {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    return res.status(500).json({ error: 'ADMIN_EMAIL não configurado no servidor.' });
  }

  if (!req.user || req.user.email.toLowerCase() !== adminEmail.toLowerCase()) {
    return res.status(403).json({ error: 'Acesso restrito ao administrador.' });
  }

  next();
};

export default adminMiddleware;
