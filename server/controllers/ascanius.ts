import { exec } from 'child_process';

const ascanius = (folderName: string) => {
	try {
		exec(`python main.py ${folderName}`, (err, stdout, stderr) => {
			console.log(stdout);
			console.log(stderr);
		});
	} catch (e) {
		console.error(e);
	}
}

export default ascanius;