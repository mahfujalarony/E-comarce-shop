import { io } from 'socket.io-client';

const token = localStorage.getItem('token');


const socket = io(`${import.meta.env.VITE_APP_API_URL}`, {
  auth: {
    token
  }
});
export default socket;