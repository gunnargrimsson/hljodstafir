import { Server } from 'socket.io';

let io;

const initIO = (server) => {
  io = new Server(server);
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

export { initIO, getIO };