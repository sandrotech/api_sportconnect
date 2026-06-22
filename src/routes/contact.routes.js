import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Envia uma mensagem de contato por e-mail
 *     tags: [Contato]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - assunto
 *               - mensagem
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               assunto:
 *                 type: string
 *               mensagem:
 *                 type: string
 *     responses:
 *       200:
 *         description: E-mail enviado com sucesso
 *       400:
 *         description: Dados incompletos
 *       500:
 *         description: Erro interno no servidor
 */
router.post('/', async (req, res) => {
  const { nome, email, assunto, mensagem } = req.body;

  if (!nome || !email || !assunto || !mensagem) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: `[SportConnect Contato] ${assunto}`,
      text: `Nome: ${nome}\nE-mail: ${email}\n\nMensagem:\n${mensagem}`,
      replyTo: email,
    };

    await transporter.sendMail(mailOptions);
    
    return res.status(200).json({ success: true, message: 'Mensagem enviada com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return res.status(500).json({ error: 'Ocorreu um erro ao enviar a mensagem. Tente novamente mais tarde.' });
  }
});

export default router;
