import Image from 'next/image';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Notification } from '@mantine/core';
import { Check, X } from 'tabler-icons-react';
import { getFiles } from './api/files';
import axios from 'axios';
import FileInputButton from '../components/FileInputButton';
import nProgress from 'nprogress';
import { io, Socket } from 'socket.io-client';
import { socketMessage } from '../interfaces';
import useLocalStorage from '../hooks/useLocalStorage';
import Messages from '../components/Messages';

interface clientExtendedSocket extends Socket {
	sessionID?: string;
	userID?: string;
}

const socket: clientExtendedSocket = io('http://localhost:3000', { autoConnect: false });

interface clientInfo {
	sessionID?: string;
	userID?: string;
}

interface IFile {
	name: string;
	date: string;
	size: number;
	sizeInMB: string;
	url: string;
}

interface IFetchProps {
	data: {
		files: IFile[];
	}
}

const IndexPage = ({ mapFiles }) => {
	const router = useRouter();
	const redirected = router.query.redirected;
	const [uploaded, setUploaded] = useState<boolean>(false);
	const [error, setError] = useState<string>(null);
	const [uploadMessage, setUploadMessage] = useState<string>(null);
	const [files, setFiles] = useState<IFile[]>(mapFiles);
	const [messages, setMessages] = useState<socketMessage[]>([]);
	const [client, setClient] = useLocalStorage<clientInfo>('clientInfo', {});
	const [connected, setConnected] = useState<boolean>(false);

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

	useEffect(() => {
		connectUser();
		socket.on('ascanius-done', async (message: socketMessage) => {
			setMessages((messages) => [...messages, message]);
			const fetchFiles: IFetchProps = await axios.get('http://localhost:3000/api/files');
			if (fetchFiles?.data?.files) {
				setFiles(fetchFiles.data.files);
			}
		});
		socket.on('ascanius-error', (message: socketMessage) => {
			setUploaded(false);
			setError(message.message);
			setMessages((messages) => [...messages, message]);
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

		if (res.status === 200) {
			setUploaded(true);
			setError(null);
			try {
				socket.emit('ascanius', res.data.data[0].split('.')[0]);
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
					{messages.length === 0 && (
						<div className='px-5 my-10 py-4 bg-white rounded-sm flex flex-col'>
							<div className='w-full text-center font-semibold text-2xl mt-2 mb-4'>Upload</div>
							<FileInputButton
								label='Upload EPUB'
								uploadFileName='files'
								acceptedFileTypes='application/epub+zip'
								onChange={onChange}
							/>
						</div>
					)}
					<Messages messages={messages} />
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
