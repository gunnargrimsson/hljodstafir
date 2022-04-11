import fs from 'fs';
import path from 'path';

export const getFiles = async () => {
	const fileLoc = path.join('public', 'output');
	const files = fs.readdirSync(fileLoc);
	const mapFiles = files.map((file) => path.join('output', file));
	return { props: { mapFiles } };
};
