import { io } from 'socket.io-client';
//const userData = localStorage.getItem('user');
const token = localStorage.getItem('token');
console.log('token', token);
//console.log('userId', userId);

const socket = io('http://localhost:3001', {
  auth: {
    token
  }
});
export default socket;