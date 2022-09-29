import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { QuestionMark } from 'tabler-icons-react';
import { getFiles, getLogs, getAppVersion } from './api/files';
import axios from 'axios';
import FileInputButton from '../components/FileInputButton';
import nProgress from 'nprogress';
import { io } from 'socket.io-client';
import { socketMessage } from '../interfaces';
import useLocalStorage from '../hooks/useLocalStorage';
import Messages from '../components/Messages';
import { clientExtendedSocket, clientInfo, IFetchProps, IFile } from '../interfaces/client';
import Notifications from '../components/Notifications';
import Tooltip from '../components/Tooltip';
import Container from '../components/Container';
// import Languages from '../constants/languages.json';

const socket: clientExtendedSocket = io('/', { autoConnect: false });

const IndexPage = ({ mapFiles, mapLogs, appVersion }) => {
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
	const [ignoreAside, setIgnoreAside] = useState<boolean>(false);
	const [adjusting, setAdjusting] = useState<boolean>(false);
	const [parentHighlighting, setParentHighlighting] = useState<boolean>(false);
	const [adjustment, setAdjustment] = useState<number>(125);
	const [longerAudio, setLongerAudio] = useState<boolean>(false);

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
				console.error(err);
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
			socket.auth = { sessionID };
			socket.userID = userID;
			setClient({ sessionID, userID });
		});

		return () => {
			socket.off('ascanius-done');
			socket.off('ascanius-error');
			socket.off('ascanius-relay');
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
				socket.emit('ascanius', res.data.data[0].split('.')[0], {
					language: languageCode,
					ignoreAside: ignoreAside,
					adjustment: adjusting ? adjustment : 0,
					parentHighlighting: parentHighlighting,
					longerAudio: longerAudio,
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
	};

	const handleCloseFeed = () => {
		setCanCloseMessages(false);
		setMessages([]);
	};

	return (
		<Container>
				<Notifications
					uploaded={uploaded}
					setUploaded={setUploaded}
					uploadMessage={uploadMessage}
					error={error}
					setError={setError}
				/>
				<div className='bg-gray-200 h-full relative'>
					<div className='absolute font-extralight text-xs opacity-50 p-2 right-0 select-none pointer-events-none'>v {appVersion}</div>
					<div className='flex place-content-center justify-center'>
						{messages.length === 0 && (
							<div className='px-5 my-10 py-4 bg-white rounded-sm flex flex-col'>
								<div className='w-full text-center font-semibold text-2xl mt-2 mb-4'>Upload</div>
								<div className='w-full flex flex-col py-4 gap-2'>
									<label className='font-medium' htmlFor='selectLanguage'>
										Select Language{' '}
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
									<div className='p-2 shadow-red'>
										<div className='text-red-700 text-sm underline'>
											<Tooltip text='These features are still in development and may not work as expected. Please notify us of any issues you encounter.'>
												Experimental
											</Tooltip>
										</div>
										<div className='flex flex-col rounded-sm relative milliseconds'>
											<div className='flex gap-2 place-items-center rounded-sm'>
											<input
												className='w-4 h-4'
												checked={adjusting}
												onChange={() => setAdjusting(!adjusting)}
												type='checkbox'
												id='adjusting'
											/>
											<label className='flex font-medium' htmlFor='adjustment'>
												Adjust highlighting
												<Tooltip text='Highlighting of text will be adjusted by x ms, larger number will make the highlighting occur sooner.'>
													<QuestionMark
														className='bg-slate-800 hover:bg-slate-700 text-white place-self-center rounded-full p-0.5 ml-1'
														size={18}
													/>
												</Tooltip>
											</label>
											</div>
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
											<label className='flex font-medium' htmlFor='ignoreAside'>
												Ignore Image Text
												<Tooltip
													text='Image text placed inside of &lt;aside&gt; is not read in book and therefore should be ignored
													by hljóðstafir.'
												>
													<QuestionMark
														className='bg-slate-800 hover:bg-slate-700 text-white place-self-center rounded-full p-0.5 ml-1'
														size={18}
													/>
												</Tooltip>
											</label>
										</div>
										<div className='flex gap-2 place-items-center rounded-sm'>
											<input
												className='w-4 h-4'
												checked={parentHighlighting}
												onChange={() => setParentHighlighting(!parentHighlighting)}
												type='checkbox'
												id='parentHighlighting'
											/>
											<label className='flex font-medium' htmlFor='parentHighlighting'>
												Sentence & Paragraph Highlighting
												<Tooltip text='Paragraphs are highlighted simultaneously if more than one sentence is present.'>
													<QuestionMark
														className='bg-slate-800 hover:bg-slate-700 text-white place-self-center rounded-full p-0.5 ml-1'
														size={18}
													/>
												</Tooltip>
											</label>
										</div>
										<div className='flex gap-2 place-items-center rounded-sm'>
											<input
												className='w-4 h-4'
												checked={longerAudio}
												onChange={() => setLongerAudio(!longerAudio)}
												type='checkbox'
												id='longerAudio'
											/>
											<label className='flex font-medium' htmlFor='longerAudio'>
												Allow mp3 files longer than 30 minutes
												<Tooltip text='MP3 files longer than 30 minutes may result in a much longer wait time to process the alignment.'>
													<QuestionMark
														className='bg-slate-800 hover:bg-slate-700 text-white place-self-center rounded-full p-0.5 ml-1'
														size={18}
													/>
												</Tooltip>
											</label>
										</div>
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
					<div className='bg-gray-300 flex flex-col pb-8'>
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
									<Link href={'/api/download/' + file.url}>
										{file.name + ' - ' + file.date + ' - ' + file.sizeInMB}
									</Link>
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
									<Link href={'/api/download/' + file.url}>
										{file.name + ' - ' + file.date + ' - ' + file.sizeInMB}
									</Link>
								</div>
							))}
					</div>
				</div>
		</Container>
	);
};

export async function getServerSideProps() {
	const { mapFiles } = await getFiles();
	const { mapLogs } = await getLogs();
	const appVersion = await getAppVersion();
	return { props: { mapFiles, mapLogs, appVersion } };
}

export default IndexPage;
