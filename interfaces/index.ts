// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import { User } from 'path/to/interfaces';

import { Socket } from "socket.io";

export type User = {
  id: number
  name: string
}

export interface socketMessage {
	message: string;
	delivered: string;
	highlight: boolean;
	color: string;
}

export interface extendedSocket extends Socket {
	sessionID: string;
	userID: string;
}