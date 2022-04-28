import { spawn } from 'child_process';
import { Socket } from 'socket.io';
import { socketMessage } from '../../interfaces';

const ascanius = (folderName: string, socket: Socket) => {
	try {
		const process = spawn('python', ['main.py', folderName]);
		process.stdout.on('data', (data) => {
			const hasError = data.toString().toLowerCase().includes('ERROR');
			const message: socketMessage = {
				message: data.toString(),
				delivered: new Date().toISOString(),
				highlight: hasError ? true : false,
				color: hasError ? 'text-red-500' :'text-black',
			};
			socket.emit('ascanius-relay', message);
		});
		process.stderr.on('data', (data) => {
			// Errors also get relayed, in case of crashes
			let message: socketMessage = {
				message: data.toString(),
				delivered: new Date().toISOString(),
				highlight: true,
				color: 'text-red-500',
			};
			socket.emit('ascanius-relay', message);
		});
	} catch (error) {
		console.error(error);
	}
};

export default ascanius;
