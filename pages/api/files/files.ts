import fs from 'fs';
import path from 'path';

export const getFiles = async () => {
	const fileLoc = path.join('public', 'uploads');
	const files = fs.readdirSync(fileLoc);
	const mapFiles = files.map((file) => path.join('uploads', file));
	return { props: { mapFiles } };
};
