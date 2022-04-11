import Image from 'next/image';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import { Notification } from '@mantine/core';
import { Check, X } from 'tabler-icons-react';
import { getFiles } from './api/files';
import axios from 'axios';
import FileInputButton from '../components/FileInputButton';
import nProgress from 'nprogress';

const IndexPage = ({ mapFiles }) => {
	const router = useRouter();
	const redirected = router.query.redirected;
	const [uploaded, setUploaded] = useState<boolean>(false);
	const [error, setError] = useState<string>(null);
	const [uploadMessage, setUploadMessage] = useState<string>(null);
	const [files, setFiles] = useState<string[]>(mapFiles);

	const onChange = async (formData: FormData) => {
		nProgress.configure({ showSpinner: true });
		nProgress.start();
		const config = {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
			onUploadProgress: (progressEvent) => {
				const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
				console.log(percentCompleted);
			},
		};
		const res = await axios.post('/api/upload', formData, config);
		if (res.status === 200) {
			setUploaded(true);
			setError(null);
			setUploadMessage('File uploaded');
			nProgress.done();
		} else {
			setError(res.data.message);
			setUploadMessage(null);
		}
	};

	return (
		<div className='flex h-screen flex-col'>
			<div className='w-full px-5 py-10'>
				<h1 className='text-2xl font-semibold'>Hljóðstafir</h1>
			</div>
			{uploaded && (
				<Notification onClose={() => setUploaded(false)} icon={<Check size={18} />} color='teal' title='Upload Status'>
					{uploadMessage}
				</Notification>
			)}
			{error && (
				<Notification onClose={() => setError(null)} icon={<X size={18} />} color='red' title='Upload Status'>
					{error}
				</Notification>
			)}
			<div className='bg-gray-200 h-full'>
				<div className='flex place-content-center justify-center'>
					<div className='px-5 my-10 py-4 bg-white rounded-sm flex flex-col'>
						<div className='w-full text-center font-semibold text-2xl mt-2 mb-4'>Upload</div>
						<FileInputButton
							label='Upload EPUB'
							uploadFileName='files'
							acceptedFileTypes='application/epub+zip'
							onChange={onChange}
						/>
					</div>
				</div>
				<div className='bg-gray-300 flex flex-col'>
					{files.map((file: any, index: number) => (
						<div key={index} className='hover:bg-blue-400 px-8 py-1 cursor-pointer'>
							<span className='mr-2 font-semibold'>{index + 1}</span>
							<Link href={'/' + file.url}>{file.name + ' - ' + file.date + ' - ' + file.sizeInMB}</Link>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export async function getServerSideProps() {
	return getFiles();
}

export default IndexPage;
