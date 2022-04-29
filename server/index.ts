import express, { Request, Response } from 'express';
import next, { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import ascanius from './controllers/ascanius';
import http from 'http';
import { initIO } from './controllers/socket';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { extendedSocket } from '../interfaces';

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const port = process.env.PORT || 3000;

(async () => {
	try {
		await nextApp.prepare();
		const app = express();
		app.use(express.json({ limit: '1gb' }));
		app.use(express.urlencoded({ extended: true, limit: '1gb' }));
		const server = http.createServer(app);
		const io: Server = initIO(server);

		const upload = multer({
			storage: multer.diskStorage({
				destination: './public/uploads',
				filename: (req, file, cb) => {
					console.log(file);
					cb(null, `${file.originalname}`);
				},
			}),
			limits: { fileSize: 1024 ** 3 },
		});

		const uploadFiles = upload.array('files');

		app.post('/api/upload', uploadFiles, async (req, res) => {
			const filenames = fs.readdirSync('./public/uploads');
			const files = filenames.map((file) => file);
			res.status(200).json({ data: files });
		});

		// temp session database
		let sessionStore = {};

		io.use((socket: extendedSocket, next) => {
			console.log(sessionStore);
			const sessionID = socket.handshake.auth.sessionID;
			if (sessionID) {
				// find existing session
				const session = sessionStore[sessionID];
				if (session) {
					socket.sessionID = sessionID;
					socket.userID = session.userID;
					return next();
				}
			}
			// create new session
			socket.sessionID = uuidv4();
			socket.userID = uuidv4();
			sessionStore[socket.sessionID] = { userID: socket.userID, sessionID: socket.sessionID };
			next();
		});

    io.on('connection', async (socket: extendedSocket) => {
			await socket.join(socket.sessionID);
			socket.emit('user-connected', { sessionID: socket.sessionID, userID: socket.userID });

      socket.on('ascanius', (folderName: string) => {
				// Need to send the info to sender so we throw him the io reference
        ascanius(folderName, socket.sessionID, io);
      });

			socket.on('disconnect', (data) => {
        socket.emit('user-disconnect');
				console.log('user disconnected');
			});
		});

		app.all('*', (req: Request, res: Response) => {
			return handle(req, res);
		});

		server.listen(port, (err?: Error) => {
			if (err) throw err;
			console.log(
				`> Ready on http://localhost:${port} - env ${process.env.NODE_ENV ? process.env.NODE_ENV : 'development'}`
			);
		});
	} catch (e) {
		console.error(e);
		process.exit(1);
	}
})();