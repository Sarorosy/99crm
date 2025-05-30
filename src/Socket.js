// socket.js (Singleton for Socket Connection)
import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
    if (!socket) {
        socket = io("https://nine9crmsocket.onrender.com", { //https://nine9crmsocket.onrender.com
            reconnection: true,
            reconnectionAttempts: 1,
            reconnectionDelay: 3000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            autoConnect: true,
        });
    }
    return socket;
};

//http://localhost:5000