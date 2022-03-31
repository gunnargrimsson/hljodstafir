import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import multer from 'multer';

export const config = {
	api: {
		bodyParser: false,
	},
};

const upload = multer({
	storage: multer.diskStorage({
		destination: './public/uploads',
		filename: (req, file, cb) => {
			console.log(file);
			cb(null, `${Date.now()}-${file.originalname}`);
		},
	}),
});

const apiRoute = nextConnect({
	onError(error: Error, req: NextApiRequest, res: NextApiResponse) {
		res.status(501).json({ error: `${error.message}` });
	},
	onNoMatch(req: NextApiRequest, res: NextApiResponse) {
		res.status(405).json({ error: 'Not allowed' });
	},
});

const uploadMiddleware = upload.array('files');

apiRoute.use(uploadMiddleware);

apiRoute.post((req: NextApiRequest, res: NextApiResponse) => {
	const filenames = fs.readdirSync('./public/uploads');
	const files = filenames.map((file) => file);

	res.status(200).json({ data: files });
});

export const getFiles = async () => {
	const fileLoc = path.join('public', 'uploads');
	const files = fs.readdirSync(fileLoc);
	const mapFiles = files.map((file) => path.join('uploads', file));
	return { props: { mapFiles } };
};

export default apiRoute;
