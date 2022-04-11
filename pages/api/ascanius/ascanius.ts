import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';

async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
    const folderName = req.body.folderName;
	  exec(`python main.py ${folderName}`, (err, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
    });
		res.status(200).json({});
	} catch (e) {
		console.error(e);
		return res.status(500).json({ error: e.message });
	}
}

export default handler;
