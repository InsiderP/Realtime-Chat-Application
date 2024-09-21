const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const http = require("http").createServer(app);


app.use(express.json());

http.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const io = require("socket.io")(http);

io.on("connection", (socket) => {
  console.log(`User connected with socket ID ${socket.id}`);

  socket.on("message", (msg) => {
    
    socket.broadcast.emit("message", msg);
  });

  socket.on("disconnect", () => {
    console.log(`User with socket ID ${socket.id} disconnected`);
  });
});

 
app.post("/broadcast", (req, res) => {
  const message = "This is a hardcoded message"; 
  
  io.emit("message", message); 
  res.send({ status: "message broadcasted to all users", message });
});


app.post("/send/:id", (req, res) => {
  const socketId = req.params.id;
  const message = "This is to a specific client"; 

  const socket = io.sockets.sockets.get(socketId); 

  if (socket) {
    socket.emit("message", message); 
    res.send({ status: `Message sent to user with ID ${socketId}`, message });
  } else {
    res.status(404).send({ status: "Socket ID not found" });
  }
});
