import express from "express";
import bodyParser from "body-parser";
import http from "http"; // Import http
import router from "./routes/api";
import db from "./utils/database";
import { initSocket } from "./utils/socketService"; // Import socket service

async function init() {
  try {
    const result = await db();
    console.log(`Database status: ${result}`);

    const app = express();
    const PORT = 3000;

    // Setup Middleware & CORS
    app.use(bodyParser.json());
    app.use((req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      next();
    });

    // Bungkus Express dengan HTTP Server
    const server = http.createServer(app);

    // Inisialisasi Socket.io
    initSocket(server);

    app.get("/", (req, res) => {
      res.status(200).json({
        message: "Server backend asah is running",
      });
    });

    app.use("/api", router);

    // PENTING: Gunakan server.listen, BUKAN app.listen
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

init();