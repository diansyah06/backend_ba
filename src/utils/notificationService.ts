import { Server, Socket } from "socket.io";
import admin from "firebase-admin";
import UserModel from "../models/user.model";

// Inisialisasi Firebase Admin
// Pastikan kamu sudah menaruh file serviceAccountKey.json di root project
// atau set environment variable GOOGLE_APPLICATION_CREDENTIALS
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const serviceAccount = require("../../serviceAccountKey.json"); 
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("Firebase Admin Initialized");
} catch (error) {
  console.log("Firebase init skipped (Check serviceAccountKey.json)");
}

let io: Server;
// Map untuk menyimpan userId -> socketId
const onlineUsers = new Map<string, string>();

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Sesuaikan dengan URL frontend nanti
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    // Event saat user login/buka web: daftarkan ID mereka
    socket.on("register_user", (userId: string) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        console.log(`User ${userId} is Online with socket ${socket.id}`);
      }
    });

    socket.on("disconnect", () => {
      // Hapus user dari map saat disconnect
      onlineUsers.forEach((value, key) => {
        if (value === socket.id) onlineUsers.delete(key);
      });
    });
  });
};

// Fungsi Hybrid Push Notification
export const sendNotification = async (
  targetUserId: string,
  title: string,
  message: string,
  dataPayload?: any
) => {
  try {
    // 1. Cek apakah user ONLINE
    const socketId = onlineUsers.get(targetUserId.toString());

    if (socketId) {
      // JIKA ONLINE: Kirim via Socket.io
      io.to(socketId).emit("notification", {
        title,
        message,
        data: dataPayload,
      });
      console.log(`Notif sent via SOCKET to ${targetUserId}`);
    } else {
      // JIKA OFFLINE: Kirim via FCM
      const user = await UserModel.findById(targetUserId);
      if (user && user.fcmToken) {
        await admin.messaging().send({
          token: user.fcmToken,
          notification: {
            title: title,
            body: message,
          },
          data: {
            payload: JSON.stringify(dataPayload || {}),
          },
        });
        console.log(`Notif sent via FCM to ${targetUserId}`);
      } else {
        console.log(`User ${targetUserId} is OFFLINE and has NO FCM Token`);
      }
    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};