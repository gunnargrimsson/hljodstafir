import { spawn } from 'child_process';
import { Server } from 'socket.io';
import { IOptions, socketMessage } from '../../interfaces';

const ascanius = (folderName: string, userID: string, io: Server, options: IOptions) => {
	try {
		console.log(options);
		const stringOptions = {
			ignoreAside: options.ignoreAside.toString(),
			adjustments: options.adjustment.toString()
		};
		const process = spawn('python', ['main.py', folderName, options.language, stringOptions.ignoreAside, stringOptions.adjustments]);
		process.stdout.on('data', (data: string) => {
			const hasError = data.toString().toLowerCase().includes('error');
			const done = data.toString().toLowerCase().includes('done');
			if (done) {
				const doneMessage: socketMessage = { message: 'Finished Processing', delivered: new Date().toString(), highlight: false }
				io.to(userID).emit('ascanius-done', doneMessage);
			} else {
				const message: socketMessage = {
					message: data.toString(),
					delivered: new Date().toISOString(),
					highlight: hasError ? true : false,
				};
				io.to(userID).emit('ascanius-relay', message);
			}
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
		console.log('We can delete the file here as well?');
		console.error(error);
	}
};

export default ascanius;
