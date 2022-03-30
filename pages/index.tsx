import Image from 'next/image';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import hbsLogo from '../public/images/hbs.png';
import arrow from '../public/images/arrow.svg';
import { Notification } from '@mantine/core';
import { Check, X } from 'tabler-icons-react';
import fs from 'fs';
import path from 'path';
import { getPageFiles } from 'next/dist/server/get-page-files';
import { getFiles } from './api/upload';

const IndexPage = ({ mapFiles }) => {
	const router = useRouter();
	const redirected = router.query.redirected;
	const [open, setOpen] = useState(true);
	const [file, setFile] = useState(null);
	const [createObjectURL, setCreateObjectURL] = useState<string>(null);
	const [uploaded, setUploaded] = useState<boolean>(false);
	const [error, setError] = useState<string>(null);
	const [uploadMessage, setUploadMessage] = useState<string>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [files, setFiles] = useState<string[]>(mapFiles);

	const Menus = [
		{ title: 'Dashboard', src: 'Chart_fill' },
		{ title: 'Accounts', src: 'User', gap: true },
		{ title: 'Setting', src: 'Setting' },
	];

	const SideBar = () => {
		return (
			<div className={` ${open ? 'w-96' : 'w-24 '} bg-blue-900 h-screen p-5 pt-10 relative duration-300`}>
				<div
					className={`absolute bg-white cursor-pointer -right-3 top-9 w-7 h-7 ring-blue-900 ring-2 rounded-full flex place-content-center ${
						!open && 'rotate-180'
					}`}
					onClick={() => setOpen(!open)}
				>
					<Image src={arrow} height={10} width={10} />
				</div>
				<div className='flex items-center'>
					<Image src={hbsLogo} width={32} height={32} className={`cursor-pointer`} />
					<h1 className={`ml-4 text-white origin-left font-medium text-xl duration-500 ${!open && 'scale-0'}`}>
						Hljóðstafir
					</h1>
				</div>
				<ul className='pt-6'>
					{Menus.map((Menu, index) => (
						<li
							key={index}
							className={`flex  rounded-sm p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 
              ${Menu.gap ? 'mt-9' : 'mt-2'} ${index === 0 && 'bg-light-white'} `}
						>
							<Image src={`/../public/images/hbs.png`} width={16} height={16} />
							<span className={`${!open && 'hidden'} origin-left duration-200`}>{Menu.title}</span>
						</li>
					))}
				</ul>
			</div>
		);
	};

	const uploadToClient = (event) => {
		if (event.target.files && event.target.files[0]) {
			const i = event.target.files[0];
			setFile(i);
			setCreateObjectURL(URL.createObjectURL(i));
		}
	};

	const uploadToServer = async (event) => {
		if (file === null) {
			setError('No file selected');
			setUploaded(false);
			return;
		}
		const body = new FormData();
		body.append('file', file);
		const res = await fetch('/api/upload', {
			method: 'POST',
			body,
		});
		const data = await res.json();
		if (data.success) {
			setUploaded(true);
			setError(null);
			setUploadMessage(data.message);
			setFile(null);
			setCreateObjectURL(null);
			fileInputRef.current.value = null;
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
						<input
							ref={fileInputRef}
							type='file'
							name='myImage'
							accept='.epub'
							onChange={uploadToClient}
							className='file:px-4 file:py-2 file:cursor-pointer cursor-pointer file:border-0 file:bg-blue-900 file:text-white file:rounded-sm file:hover:bg-blue-700 hover:bg-blue-200 rounded-sm'
						/>
						<button
							className='px-4 py-2 mt-2 bg-blue-900 text-white rounded-sm hover:bg-blue-700'
							type='submit'
							onClick={uploadToServer}
						>
							Upload
						</button>
					</div>
				</div>
				<div className='bg-gray-300 flex flex-col'>
					{files.map((file: string, index: number) => (
						<div key={index} className='hover:bg-blue-400 px-8 py-1 cursor-pointer'>
							<span className='mr-2 font-semibold'>{index}</span>
							<Link href={'/' + file.split('\\').join('/')}>{file.split('\\').pop()}</Link>
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
