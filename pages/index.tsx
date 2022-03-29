import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import hbsLogo from '../public/images/hbs.png';
import arrow from '../public/images/arrow.svg';

const IndexPage = () => {
	const router = useRouter();
	const redirected = router.query.redirected;
	const [open, setOpen] = useState(true);
	const [file, setFile] = useState(null);
	const [createObjectURL, setCreateObjectURL] = useState<string>(null);
	const [uploaded, setUploaded] = useState<boolean>(false);
	const [uploadMessage, setUploadMessage] = useState<string>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

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
							className={`flex  rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 
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
		const body = new FormData();
		body.append('file', file);
		const res = await fetch('/api/upload', {
			method: 'POST',
			body,
		});
		const data = await res.json();
		if (data.success) {
			setUploaded(true);
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
			<div className='bg-gray-200 h-full'>
				<div className='flex place-content-center justify-center'>
					<div className='px-5 my-10 py-4 bg-white rounded-md flex flex-col'>
						<div className='w-full text-center font-semibold text-2xl mt-2 mb-4'>Upload</div>
						{uploaded && uploadMessage && (
							<div className='w-full text-center font-semibold text-2xl mt-2 mb-4'>{uploadMessage}</div>
						)}
						<input
							ref={fileInputRef}
							type='file'
							name='myImage'
							accept='.epub'
							onChange={uploadToClient}
							className='file:px-4 file:py-2 file:cursor-pointer cursor-pointer file:border-0 file:bg-blue-900 file:text-white file:rounded-md file:hover:bg-blue-700 hover:bg-blue-200 rounded-md'
						/>
						<button
							className='px-4 py-2 mt-2 bg-blue-900 text-white rounded-md hover:bg-blue-700'
							type='submit'
							onClick={uploadToServer}
						>
							Send to server
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default IndexPage;
