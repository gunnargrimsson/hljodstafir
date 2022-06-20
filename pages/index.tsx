import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Notification } from '@mantine/core';
import { Check, X } from 'tabler-icons-react';
import { getFiles } from './api/files';
import axios from 'axios';
import FileInputButton from '../components/FileInputButton';
import nProgress from 'nprogress';
import { io } from 'socket.io-client';
import { socketMessage } from '../interfaces';
import useLocalStorage from '../hooks/useLocalStorage';
import Messages from '../components/Messages';
import { getLogs } from './api/files/files';
import { clientExtendedSocket, clientInfo, IFetchProps, IFile } from '../interfaces/client';
import Languages from '../constants/languages.json';

const socket: clientExtendedSocket = io('/', { autoConnect: false });

const IndexPage = ({ mapFiles, mapLogs }) => {
	const router = useRouter();
	const redirected = router.query.redirected;
	const [uploaded, setUploaded] = useState<boolean>(false);
	const [error, setError] = useState<string>(null);
	const [uploadMessage, setUploadMessage] = useState<string>(null);
	const [files, setFiles] = useState<IFile[]>(mapFiles);
	const [logs, setLogs] = useState<IFile[]>(mapLogs);
	const [messages, setMessages] = useState<socketMessage[]>([]);
	const [canCloseMessages, setCanCloseMessages] = useState<boolean>(false);
	const [client, setClient] = useLocalStorage<clientInfo>('clientInfo', {});
	const [connected, setConnected] = useState<boolean>(false);
	const [showing, setShowing] = useState<string>('files');
	const [languageCode, setLanguageCode] = useState<string>('isl');
	const [ignoreAside, setIgnoreAside] = useState<boolean>(true);
	const [adjustment, setAdjustment] = useState<number>(100);

	const connectUser = async () => {
		if (!connected) {
			if (client['userID'] && client['sessionID']) {
				console.log(client['userID'], 'found, connecting socket');
				socket.auth = { sessionID: client['sessionID'] };
				socket.connect();
				setConnected(true);
			} else {
				console.log('no user found, connecting new socket');
				socket.connect();
				setConnected(true);
			}
		}
	};

	const getFiles = async () => {
		const fetchFiles: IFetchProps = await axios.get('/api/files');
		if (fetchFiles?.data) {
			setFiles(fetchFiles.data.files);
			setLogs(fetchFiles.data.logs);
		}
	};

	const deleteFile = async (file) => {
		await axios
			.post('/api/delete/', { file })
			.then(() => {
				getFiles();
			})
			.catch((err) => {
				console.log(err);
			});
	};

	useEffect(() => {
		connectUser();
		socket.on('ascanius-done', async (message: socketMessage) => {
			setCanCloseMessages(true);
			setMessages((messages) => [...messages, message]);
			getFiles();
		});
		socket.on('ascanius-error', (message: socketMessage) => {
			setCanCloseMessages(true);
			setUploaded(false);
			setError(message.message);
			setMessages((messages) => [...messages, message]);
			getFiles();
		});
		socket.on('ascanius-relay', (message: socketMessage) => {
			setMessages((messages) => [...messages, message]);
		});
		socket.on('user-connected', ({ sessionID, userID }: { sessionID: string; userID: string }) => {
			// console.log('userID:', userID);
			// console.log('sessionID:', sessionID);
			socket.auth = { sessionID };
			socket.userID = userID;
			setClient({ sessionID, userID });
		});

		return () => {
			socket.off('ascanius-relay');
			socket.off('ascanius-done');
			socket.off('ascanius-error');
			socket.off('user-connected');
		};
	}, [messages, files]);

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
		console.log(res);

		if (res.status === 200) {
			setUploaded(true);
			setError(null);
			try {
				socket.emit('ascanius', res.data.data[0].split('.')[0], {
					language: languageCode,
					ignoreAside: ignoreAside,
					adjustment: adjustment,
				});
			} catch (error) {
				console.error(error);
				setUploaded(false);
				setError('Error handling file');
			}
			setUploadMessage('File uploaded');
			nProgress.done();
		} else {
			setError(res.data.message);
			setUploadMessage(null);
		}
	};

	const onShowClick = (show: string) => {
		setShowing(show);
	};

	const handleAdjustmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// only allow values between 0 and 10000
		const value = parseInt(e.target.value, 10);
		if (value >= 10000) {
			setAdjustment(10000);
		}
		if (value >= 0 && value <= 10000) {
			setAdjustment(value);
		}
		if (isNaN(value)) {
			setAdjustment(0);
		}
	}

	const handleCloseFeed = () => {
		setCanCloseMessages(false);
		setMessages([]);
	}

	return (
		<div className='flex h-screen flex-col'>
			<div className='w-full px-5 py-10'>
				<Link href={'/'}><div className='text-2xl font-semibold cursor-pointer select-none'>🎼 Hljóðstafir</div></Link>
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
					{messages.length === 0 && (
						<div className='px-5 my-10 py-4 bg-white rounded-sm flex flex-col'>
							<div className='w-full text-center font-semibold text-2xl mt-2 mb-4'>Upload</div>
							<div className='w-full flex flex-col py-4 gap-2'>
								<label className='font-medium' htmlFor='selectLanguage'>
									Select Language
								</label>
								<select
									className='flex border-2 focus:outline-none gap-2 place-items-center place-content-center rounded-sm px-2'
									onChange={(e) => setLanguageCode(e.target.value)}
									id='selectLanguage'
								>
									<option value='isl'>Icelandic</option>
									<option value='dan'>Danish</option>
									<option value='eng'>English</option>
								</select>
								<div className='flex flex-col rounded-sm relative milliseconds'>
									<label className='font-medium' htmlFor='adjustment'>
										Adjust highlighting
									</label>
									<input
										className='flex border-2 focus:outline-none gap-2 place-items-center place-content-center rounded-sm px-2 pr-8 appearance-none'
										onChange={handleAdjustmentChange}
										value={adjustment}
										type='number'
										id='adjustment'
									/>
								</div>
								<div className='flex gap-2 place-items-center rounded-sm'>
									<input
										className='w-4 h-4'
										checked={ignoreAside}
										onChange={() => setIgnoreAside(!ignoreAside)}
										type='checkbox'
										id='ignoreAside'
									/>
									<label className='font-medium' htmlFor='ignoreAside'>
										Ignore Image Text
									</label>
								</div>
							</div>
							<FileInputButton
								label='Upload EPUB'
								uploadFileName='files'
								acceptedFileTypes='application/epub+zip'
								onChange={onChange}
							/>
						</div>
					)}
					<Messages messages={messages} canCloseMessages={canCloseMessages} handleCloseFeed={handleCloseFeed} />
				</div>
				<div className='bg-gray-300 flex flex-col'>
					<div className='flex justify-center my-2'>
						<button
							onClick={() => onShowClick('files')}
							className={`px-4 py-2 ${showing === 'files' ? 'font-bold bg-white' : 'bg-gray-100'}`}
						>
							Files
						</button>
						<button
							onClick={() => onShowClick('logs')}
							className={`px-4 py-2 ${showing === 'logs' ? 'font-bold bg-white' : 'bg-gray-100'}`}
						>
							Logs
						</button>
					</div>
					{showing === 'files' &&
						files &&
						files.map((file: any, index: number) => (
							<div key={index} className='hover:bg-blue-400 px-8 py-2 cursor-pointer relative'>
								<button
									onClick={() => deleteFile(file.url)}
									className='px-2 py-1 bg-red-300 font-bold absolute right-8 top-1'
								>
									Delete
								</button>
								<span className='mr-2 font-semibold'>{index + 1}</span>
								<Link href={'/api/download/' + file.url}>{file.name + ' - ' + file.date + ' - ' + file.sizeInMB}</Link>
							</div>
						))}
					{showing === 'logs' &&
						logs &&
						logs.map((file: any, index: number) => (
							<div key={index} className='hover:bg-blue-400 px-8 py-2 cursor-pointer relative'>
								<button
									onClick={() => deleteFile(file.url)}
									className='px-2 py-1 bg-red-300 font-bold absolute right-8 top-1'
								>
									Delete
								</button>
								<span className='mr-2 font-semibold'>{index + 1}</span>
								<Link href={'/api/download/' + file.url}>{file.name + ' - ' + file.date + ' - ' + file.sizeInMB}</Link>
							</div>
						))}
				</div>
			</div>
		</div>
	);
};

export async function getServerSideProps() {
	const { mapFiles } = await getFiles();
	const { mapLogs } = await getLogs();
	return { props: { mapFiles, mapLogs } };
}

export default IndexPage;
