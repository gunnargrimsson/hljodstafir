import { Socket } from "socket.io-client";

export interface clientExtendedSocket extends Socket {
	sessionID?: string;
	userID?: string;
}

export interface clientInfo {
	sessionID?: string;
	userID?: string;
}

export interface IFile {
	name: string;
	date: string;
	size: number;
	sizeInMB: string;
	url: string;
}

export interface IFetchProps {
	data: {
		files: IFile[];
		logs: IFile[];
	}
}