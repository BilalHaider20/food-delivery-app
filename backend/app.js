import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { connectDB } from "./src/config/connect.js";
import { PORT } from "./src/config/config.js";
import { registerRoutes } from "./src/routes/index.js";



const start = async () => {
  try {

    // connect to database
    await connectDB(process.env.MONGO_URI);

    const app = express();

    // ✅  we need createServer - for Socket.IO
    const server = createServer(app);  // Express app wrapped in HTTP server

    // ✅ Socket.IO needs the HTTP server, not the Express app
    const webSocket = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      pingInterval: 10000,
      pingTimeout: 5000,
      transports: ['websocket']
    });

    // make websocket available to routes
    app.use((req, res, next) => {
      req.io = webSocket;
      next();
    })

    //middleware 
    app.use(cors());
    app.use(express.json());


    // Routes
    registerRoutes(app);


    // Socket.IO
    webSocket.on('connection', (socket) => {
      console.log("user connected", socket.id);

      socket.on("joinRoom", (orderId) => {
        socket.join(orderId);
        console.log(`user joined room ${orderId}`);
      });

      socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);
      });
    });



    // ✅ Listen on server (not app) because Socket.IO is attached to server
    server.listen(PORT, '0.0.0.0', (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`🚀 Food Delivery App running on http://localhost:${PORT}`);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
