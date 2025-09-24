import "dotenv/config";
import { connectDB } from "./src/config/connect.js";
import fastify from "fastify";
import { PORT } from "./src/config/config.js";
import fastifySocketIO from "fastify-socket"
import { registerRoutes } from "./src/routes/index.js";

const start = async () => {
  await connectDB(process.env.MONGO_URI);

  const app = fastify();
  app.register(fastifySocketIO, {
    cors: {
      origin: "*"
    },
    pingInterval: 10000,
    pingTimeout: 5000,
    transports: ['websocket']
  })

  await registerRoutes(app);

  app.listen({ port: PORT, host: '0.0.0.0' }, (err, addr) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`Grocery App running on http://localhost:${PORT}`)
    }
  });

  app.ready().then(() => {
    app.io.on("connection", (socket) => {
      console.log("user connected", socket.id);

      socket.on("joinRoom", (orderId) => {
        socket.join(orderId);
        console.log(`user joined room ${orderId}`);
      });


      socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);
      });
    });
  });

}

  start();
