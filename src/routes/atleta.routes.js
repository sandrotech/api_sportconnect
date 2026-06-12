import { Router } from 'express';
import atletaController from '../controllers/atleta.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client, CreateBucketCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import path from 'path';

const router = Router();

// Configure S3 Client for MinIO
const s3 = new S3Client({
  endpoint: process.env.MINIO_SERVER_URL || 'http://127.0.0.1:9000',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER || 'admin',
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD || 'Cometa@123',
  },
  forcePathStyle: true,
});

// Initialize Bucket
const bucketName = process.env.MINIO_BUCKET_NAME || 'sportconnect';
(async () => {
  try {
    await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
    console.log(`Bucket '${bucketName}' criado com sucesso no MinIO.`);
    
    // Set public read policy
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "PublicReadGetObject",
          Effect: "Allow",
          Principal: "*",
          Action: "s3:GetObject",
          Resource: `arn:aws:s3:::${bucketName}/*`
        }
      ]
    };
    await s3.send(new PutBucketPolicyCommand({ Bucket: bucketName, Policy: JSON.stringify(policy) }));
    console.log(`Política pública aplicada ao bucket '${bucketName}'.`);
  } catch (err) {
    if (err.name !== 'BucketAlreadyExists' && err.name !== 'BucketAlreadyOwnedByYou') {
      console.error('Erro ao inicializar bucket do MinIO:', err);
    }
  }
})();

// Configure Multer S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'uploads/' + uniqueSuffix + path.extname(file.originalname));
    }
  })
});

/**
 * @swagger
 * tags:
 *   name: Atleta
 *   description: Rotas exclusivas para Atletas
 */

/**
 * @swagger
 * /atleta/me:
 *   get:
 *     summary: Obter perfil do Atleta logado
 *     tags: [Atleta]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do Atleta
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido (role incorreta)
 */
router.get('/me', authMiddleware, roleMiddleware(['ATLETA']), atletaController.getMe);

/**
 * @swagger
 * /atleta/me:
 *   put:
 *     summary: Atualizar perfil do Atleta logado
 *     tags: [Atleta]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               apelido:
 *                 type: string
 *               telefone:
 *                 type: string
 *               localizacao:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       400:
 *         description: Erro na atualização
 */
router.put('/me', authMiddleware, roleMiddleware(['ATLETA']), upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), atletaController.updateMe);

export default router;
