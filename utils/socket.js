import { Server } from "socket.io";

let io;
const onlineUsers = new Map(); // userId -> socketId

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
           "https://nishiogram.vercel.app",
      ],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // user comes online
    socket.on("user_online", (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      io.emit("online_users", Array.from(onlineUsers.keys()));
    });

    // join a conversation room
    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
    });

    // leave a conversation room
    socket.on("leave_conversation", (conversationId) => {
      socket.leave(conversationId);
    });

    // send message — broadcast to room
    socket.on("send_message", (message) => {
      io.to(message.conversation).emit("receive_message", message);
    });

    // typing indicator
    socket.on("typing", ({ conversationId, userId, userName }) => {
      socket.to(conversationId).emit("user_typing", { userId, userName });
    });

    socket.on("stop_typing", ({ conversationId, userId }) => {
      socket.to(conversationId).emit("user_stop_typing", { userId });
    });

    // disconnect
    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit("online_users", Array.from(onlineUsers.keys()));
      }
    });
  });

  return io;
};

export const getIO = () => io;