import { Server, Socket } from "socket.io";

let io: Server;
// Map untuk menyimpan userId -> socketId
// Contoh: "user_id_123" -> "socket_id_abc"
const onlineUsers = new Map<string, string>();

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Mengizinkan semua origin (bisa diganti URL frontend spesifik nanti)
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("Client connected:", socket.id);

    // Event: User Login/Online
    socket.on("register_user", (userId: string) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        console.log(`User ${userId} registered with socket ${socket.id}`);
      }
    });

    // Event: Disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      // Hapus user dari map
      for (const [key, value] of onlineUsers.entries()) {
        if (value === socket.id) {
          onlineUsers.delete(key);
          break;
        }
      }
    });
  });
};

// Fungsi untuk mengirim notifikasi ke user tertentu
export const sendSocketNotification = (targetUserId: string, eventName: string, data: any) => {
  const socketId = onlineUsers.get(targetUserId);
  
  if (socketId && io) {
    io.to(socketId).emit(eventName, data);
    console.log(`[SOCKET] Notification sent to ${targetUserId}`);
    return true;
  } else {
    console.log(`[SOCKET] User ${targetUserId} is OFFLINE (Socket not found)`);
    return false;
  }
};