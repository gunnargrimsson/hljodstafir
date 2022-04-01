import express, { Request, Response } from 'express';
import next, { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

(async () => {
  try {
    await app.prepare();
    const server = express();
    server.use(express.json());
    server.use(express.urlencoded({ extended: true }));

    const upload = multer({
      storage: multer.diskStorage({
        destination: './public/uploads',
        filename: (req, file, cb) => {
          console.log(file);
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
      limits: { fileSize: 1024 * 1024 * 1024 },
    });

    const uploadFiles = upload.array('files');

    server.post('/api/upload', uploadFiles, async (req, res) => {
      const filenames = fs.readdirSync('./public/uploads');
      const files = filenames.map((file) => file);
      console.log('hello')
      res.status(200).json({ data: files });
    });

    server.all('*', (req: Request, res: Response) => {
      return handle(req, res);
    });
    server.listen(port, (err?: Error) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${port} - env ${process.env.NODE_ENV}`);
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();