import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
	api: {
		bodyParser: {
			sizeLimit: '1gb',
		},
	},
};

const post = (req: NextApiRequest, res: NextApiResponse) => {
	const form = new formidable.IncomingForm();
	try {
		form.parse(req, async (err, fields, files) => {
			await saveFile(files.file ? files.file : files.files[0]);
		});
		return res.status(201).json({ success: true, message: 'File uploaded' });
	} catch (err) {
		console.log(err);
		return res.status(500).json({ success: false, message: 'Error uploading file' });
	}
};

const saveFile = async (file: formidable.File) => {
	const data = fs.readFileSync(file.filepath);
	fs.writeFileSync(`./public/uploads/${file.originalFilename}`, data);
	await fs.unlinkSync(file.filepath);
	return true;
};

export const getFiles = async () => {
	const fileLoc = path.join('public', 'uploads');
	const files = fs.readdirSync(fileLoc);
	const mapFiles = files.map((file) => path.join('uploads', file));
	return { props: { mapFiles } };
}

export default (req: NextApiRequest, res: NextApiResponse) => {
	req.method === 'POST'
		? post(req, res)
		: req.method === 'PUT'
		? console.log('PUT')
		: req.method === 'DELETE'
		? console.log('DELETE')
		: req.method === 'GET'
		? console.log('GET')
		: res.status(404).send('');
};
