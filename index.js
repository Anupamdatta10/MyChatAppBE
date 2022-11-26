const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let users=[]
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data.room);
    users.push({user:data.user,room:data.room,id:socket.id})
    socket.to(data.room).emit("user_join", {"author":'system',"message":`${data.user} joined`,"time":new Date(),"room":data.room});
    console.log(`User with ID: ${socket.id} name ${data.user} joined room: ${data.room}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", (data) => {
    for(let i=0; i<users.length; i++){
      if(users[i].id==socket.id){
        socket.to(users[i].room).emit("user_join", {"author":'system',"message":`${users[i].user} left`,"time":new Date(),"room":users[i].room});
      }
    }
    // 
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});
