import { io } from 'socket.io-client';
const userData = localStorage.getItem('user');
const userId = userData ? JSON.parse(userData)._id : null;
console.log('userId', userId);

const socket = io('http://localhost:3001', {
  query: {
    userId
  }
});
export default socket;