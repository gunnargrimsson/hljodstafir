import express, { Request, Response } from 'express';
import next from 'next';
import multer from 'multer';
import fs from 'fs';
import ascanius from './controllers/ascanius';
import http from 'http';
import { initIO } from './controllers/socket';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { v5 as uuidv5 } from 'uuid';
import { extendedSocket, IOptions } from '../interfaces';
import dayjs from 'dayjs';

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const port = process.env.PORT || 3000;
const ignoreUploadFolderNames = ['temp'];

(async () => {
	try {
		const timeRegex = /[\.\-\:]/g;
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
					cb(null, `${dayjs().toISOString().replaceAll(timeRegex, '_')}_remove-timestamp_${file.originalname}`);
				},
			}),
			limits: { fileSize: 1024 ** 3 },
		});

		const uploadFiles = upload.array('files');

		app.post('/api/upload', uploadFiles, async (req, res) => {
			const filenames = fs.readdirSync('./public/uploads');
			// ignore upload folder names
			const filteredFilenames = filenames.filter((filename) => !ignoreUploadFolderNames.includes(filename));
			// sort files by upload time
			const sortedFilenames = filteredFilenames.sort((a, b) => {
				const aTime = dayjs(a.split('_remove-timestamp_')[0]);
				const bTime = dayjs(b.split('_remove-timestamp_')[0]);
				return aTime.isAfter(bTime) ? 1 : -1;
			});
			const files = sortedFilenames.map((file) => file);
			// sends back files in sorted order to client so clients file is on top of the list
			res.status(200).json({ data: files });
		});

		// download file
		app.get('/api/download/:location/:file', async (req, res) => {
			const file = req.params.file;
			const location = req.params.location;
			res.download(`./public/${location}/${file}`);
			res.status(200);
		});

		app.post('/api/delete', async (req, res) => {
			const file = req.body.file;
			try {
				fs.unlinkSync(`./public/${file}`);
				res.status(200).json({ success: true, message: 'File deleted' });
			} catch (error) {
				console.error('File not found');
				res.status(500).json({ success: false, message: error.message });
			}
		});

		// temp session database
		let sessionStore = {};

		io.use((socket: extendedSocket, next) => {
			const sessionID = socket.handshake.auth.sessionID;
			const clientEmail = socket.handshake.auth.clientEmail;
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
			socket.userID = uuidv5(clientEmail, process.env.UUID_NAMESPACE);
			sessionStore[socket.sessionID] = { userID: socket.userID, sessionID: socket.sessionID };
			next();
		});

		io.on('connection', async (socket: extendedSocket) => {
			await socket.join(socket.sessionID);
			socket.emit('user-connected', { sessionID: socket.sessionID, userID: socket.userID });

			socket.on('ascanius', (fileName: string, options: IOptions) => {
				// Need to send the info to "sender" so we throw him the io reference (socket cant deliver)
				console.log("Running ascanius:", fileName);
				ascanius(fileName, socket.sessionID, io, options);
			});

			socket.on('disconnect', (data) => {
				socket.emit('user-disconnect');
				console.log('user disconnected');
			});

			socket.on('closed', (data) => {
				socket.emit('user forcefully closed the connection');
				console.log('user closed');
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
