import { spawn } from 'child_process';
import { Server } from 'socket.io';
import { IOptions, socketMessage } from '../../interfaces';

const ascanius = (fileName: string, userID: string, sessionID: string, io: Server, options: IOptions) => {
	try {
		const stringOptions = {
			ignoreAside: options.ignoreAside.toString(),
			adjustments: options.adjustment.toString(),
			parentHighlighting: options.parentHighlighting.toString(),
			longerAudio: options.longerAudio.toString(),
			userID: userID,
		};
		const process = spawn('python', [
			'main.py',
			fileName,
			options.language,
			stringOptions.ignoreAside,
			stringOptions.adjustments,
			stringOptions.parentHighlighting,
			stringOptions.longerAudio,
			stringOptions.userID,
		]);
		// process spawn with utf 8 encoding
		process.stdout.setEncoding('utf8');
		process.stdout.on('data', (data: string) => {
			const hasError = data.toString().toLowerCase().includes('error');
			const hasWarning = data.toString().toLowerCase().includes('warning');
			const done = data.toString().toLowerCase().includes('done');
			if (done) {
				const doneMessage: socketMessage = {
					message: 'Finished Processing',
					delivered: new Date().toString(),
					highlight: false,
				};
				io.to(sessionID).emit('ascanius-done', doneMessage);
			} else {
				const message: socketMessage = {
					message: data.toString(),
					delivered: new Date().toISOString(),
					highlight: hasError ? 'error' : hasWarning ? 'warning' : false,
				};
				io.to(sessionID).emit('ascanius-relay', message);
			}
		});
		process.stderr.setEncoding('utf8');
		process.stderr.on('data', (data) => {
			// Errors also get relayed, in case of crashes
			let message: socketMessage = {
				message: data.toString(),
				delivered: new Date().toISOString(),
				highlight: 'error',
			};
			io.to(sessionID).emit('ascanius-error', message);
		});
	} catch (error) {
		console.log('We can delete the file here as well?');
		console.error(error);
	}
};

export default ascanius;
