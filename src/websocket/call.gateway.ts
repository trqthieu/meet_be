import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type RoomMap = Record<string, Set<string>>;

@WebSocketGateway({ cors: true })
export class CallGateway {
  @WebSocketServer()
  server: Server;

  // rooms -> set of socket ids
  private rooms: RoomMap = {};

  @SubscribeMessage('join-room')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; userId: string },
  ) {
    const { roomId, userId } = payload;
    console.log('handleJoin', roomId, userId);

    client.data.userId = userId;
    client.join(roomId);


    if (!this.rooms[roomId]) this.rooms[roomId] = new Set();
    // inform existing members about new user
    this.rooms[roomId].forEach((socketId) => {
      // send to existing: 'new-peer' with new user's socket id & userId
      this.server.to(socketId).emit('new-peer', {
        socketId: client.id,
        userId,
      });
      // inform new user about existing peer
      client.emit('existing-peer', {
        socketId,
        userId: this.server.sockets.sockets.get(socketId)?.data.userId || null,
      });
    });

    this.rooms[roomId].add(client.id);
    console.log(`Socket ${client.id} joined room ${roomId} as ${userId}`);
  }

  @SubscribeMessage('signal')
  handleSignal(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: {
      to: string; // target socket id
      data: any; // offer/answer/candidate
      type: 'offer' | 'answer' | 'candidate';
      fromUserId?: string;
    },
  ) {
    const { to, data, type, fromUserId } = payload;
    // forward directly to target socket id
    this.server.to(to).emit('signal', {
      from: client.id,
      type,
      data,
      fromUserId: fromUserId || client.data.userId,
    });
  }

  @SubscribeMessage('chat-message')
  handleChat(client: Socket, data: { text: any; to: string, from: string }) {
    console.log('handleChat', data);
    
    this.server.in(data.to).emit('chat-message', { text: data.text, from: data.from });
  }

  @SubscribeMessage('leave-room')
  handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string } = { roomId: '' },
  ) {
    const { roomId } = payload;
    client.leave(roomId);
    if (this.rooms[roomId]) {
      this.rooms[roomId].delete(client.id);
      // notify others to remove this peer
      this.server.to(roomId).emit('peer-left', { socketId: client.id });
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    // remove from any room
    for (const [roomId, set] of Object.entries(this.rooms)) {
      if (set.has(client.id)) {
        set.delete(client.id);
        this.server.to(roomId).emit('peer-left', { socketId: client.id });
      }
    }
    console.log(`Socket ${client.id} disconnected`);
  }
}
