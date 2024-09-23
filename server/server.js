import express from 'express';
import {Server} from "socket.io";
import {createServer} from "http";

const port = 3000;
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://127.0.0.1:5173",
        methods: ["GET", "POST"],
        credentials: true,
    }
});

let activeRooms = [];
let users = {};

app.get("/", (req, res) => {
    res.send("hello");
})

io.on("connection", (socket) => {
    console.log("User Connected with ID: ", socket.id);

    socket.on("set-username", (username) => {
        users[socket.id] = username;
        console.log("Username Set: ", username);
    })

    socket.on("create-room", (roomName) => {
        if(!activeRooms.includes(roomName)){
            activeRooms.push(roomName);
            io.emit("update-rooms", activeRooms);
        }
        socket.join(roomName);
        console.log("Room Created and Joined: ", roomName);
    });

    socket.on("message", ({message, room}) =>{
        const username = users[socket.id] || 'Anonymous';
        console.log(`Received Message from ${username}: `, message);
        io.to(room).emit("receive-message", { username, message });
    });

    socket.on("join-room", (room) => {
        socket.join(room);
        console.log("User Joined Room: ", room);
    })

    // socket.emit
    socket.on("disconnect", () =>{
        console.log("User Disconnected", socket.id);
        delete users[socket.id];
    })
})

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});