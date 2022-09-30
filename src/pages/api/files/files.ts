import fs from 'fs';
import path from 'path';

const handler = async (req: any, res: any) => {
	const { userID } = req.query;
	const files = await getFiles(userID);
	const logs = await getLogs(userID);
	const version = await getAppVersion();
	res.status(200).json({ files: files.mapFiles, logs: logs.mapLogs, version: version });
};

export const getFiles = async (userID: string) => {
	try {
		const fileLoc = path.join('src', 'public', 'output', userID);
		const files = fs.readdirSync(fileLoc);
		const mapFiles = files
			.sort((a, b) => {
				// get date from file property
				const fileA = fs.statSync(path.join(fileLoc, a));
				const fileB = fs.statSync(path.join(fileLoc, b));
				return fileB.birthtime.getTime() - fileA.birthtime.getTime();
			})
			.map((filename) => {
				const file = fs.statSync(path.join(fileLoc, filename));
				return {
					name: filename,
					date: file.birthtime.toLocaleString(),
					size: file.size,
					sizeInMB: (file.size / 1024 ** 2).toFixed(2) + ' MB',
					url: `output/${userID}/${filename}`,
				};
			});
		return { mapFiles };
	} catch (error) {
		console.error(error);
		return { mapFiles: [] };
	}
};

export const getLogs = async (userID: string) => {
	try {
		const fileLoc = path.join('src', 'public', 'logs', userID);
		const files = fs.readdirSync(fileLoc);
		const mapLogs = files
			.sort((a, b) => {
				// get date from file property
				const fileA = fs.statSync(path.join(fileLoc, a));
				const fileB = fs.statSync(path.join(fileLoc, b));
				return fileB.birthtime.getTime() - fileA.birthtime.getTime();
			})
			.map((filename) => {
				const file = fs.statSync(path.join(fileLoc, filename));
				return {
					name: filename,
					date: file.birthtime.toLocaleString(),
					size: file.size,
					sizeInMB: (file.size / 1024 ** 2).toFixed(2) + ' MB',
					url: `logs/${userID}/${filename}`,
				};
			});
		return { mapLogs };
	} catch (error) {
		console.error(error);
		return { mapLogs: [] };
	}
};

export const getAppVersion = async () => {
	return process.env.NEXT_PUBLIC_VERSION;
};

export default handler;
