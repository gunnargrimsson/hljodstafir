import fs from 'fs';
import path from 'path';

const handler = async (req: any, res: any) => {
	const files = await getFiles();
	const logs = await getLogs();
	const version = await getAppVersion();
	res.status(200).json({ files: files.mapFiles, logs: logs.mapLogs, version: version });
};

export const getFiles = async () => {
	const fileLoc = path.join('public', 'output');
	const files = fs.readdirSync(fileLoc);
	const mapFiles = files.sort((a, b) => {
		// get date from file property
		const fileA = fs.statSync(path.join(fileLoc, a));
		const fileB = fs.statSync(path.join(fileLoc, b));
		return fileB.birthtime.getTime() - fileA.birthtime.getTime();
	}).map((filename) => {
		const file = fs.statSync(path.join(fileLoc, filename));
		return {
			name: filename,
			date: file.birthtime.toLocaleString(),
			size: file.size,
			sizeInMB: (file.size/(1024**2)).toFixed(2) + ' MB',
			url: `output/${filename}`
		}
	});
	return { mapFiles };
};

export const getLogs = async () => {
	const fileLoc = path.join('public', 'logs');
	const files = fs.readdirSync(fileLoc);
	const mapLogs = files.sort((a, b) => {
		// get date from file property
		const fileA = fs.statSync(path.join(fileLoc, a));
		const fileB = fs.statSync(path.join(fileLoc, b));
		return fileB.birthtime.getTime() - fileA.birthtime.getTime();
	}).map((filename) => {
		const file = fs.statSync(path.join(fileLoc, filename));
		return {
			name: filename,
			date: file.birthtime.toLocaleString(),
			size: file.size,
			sizeInMB: (file.size/(1024**2)).toFixed(2) + ' MB',
			url: `logs/${filename}`
		}
	});
	return { mapLogs };
};

export const getAppVersion = async () => {
	return process.env.REACT_APP_VERSION;
}


export default handler;