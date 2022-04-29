import { spawn } from 'child_process';
import { Server } from 'socket.io';
import { socketMessage } from '../../interfaces';

const ascanius = (folderName: string, userID: string, io: Server) => {
	try {
		const process = spawn('python', ['main.py', folderName]);
		process.stdout.on('data', (data) => {
			const hasError = data.toString().toLowerCase().includes('error');
			const message: socketMessage = {
				message: data.toString(),
				delivered: new Date().toISOString(),
				highlight: hasError ? true : false,
			};
			io.to(userID).emit('ascanius-relay', message);
		});
		process.stderr.on('data', (data) => {
			// Errors also get relayed, in case of crashes
			let message: socketMessage = {
				message: data.toString(),
				delivered: new Date().toISOString(),
				highlight: true,
			};
			io.to(userID).emit('ascanius-error', message);
		});
	} catch (error) {
		console.error(error);
	}
};

export default ascanius;
