import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class MeetingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private rooms: Map<string, Set<string>> = new Map();
  private users: Map<string, string> = new Map();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.leaveRoom(client);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, data: { roomId: string; userId: string }) {
    client.join(data.roomId);
    this.users.set(client.id, data.userId);
    
    if (!this.rooms.has(data.roomId)) {
      this.rooms.set(data.roomId, new Set());
    }
    this.rooms.get(data.roomId).add(client.id);
    
    // client.to(data.roomId).emit('user-connected', { userId: data.userId });
    
    // Send current participants to the new user
    const participants = Array.from(this.rooms.get(data.roomId))
      .filter(id => id !== client.id)
      .map(id => this.users.get(id));
    console.log('participants>>', participants);
    
    this.server.in(data.roomId).emit('current-participants', participants);
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(client: Socket, roomId: string) {
    this.leaveRoom(client, roomId);
  }

  @SubscribeMessage('offer')
  handleOffer(client: Socket, data: { offer: any; to: string; roomId: string }) {
    client.to(data.to).emit('offer', { offer: data.offer, from: client.id });
  }

  @SubscribeMessage('answer')
  handleAnswer(client: Socket, data: { answer: any; to: string }) {
    client.to(data.to).emit('answer', { answer: data.answer, from: client.id });
  }

   @SubscribeMessage('chat-message')
  handleChat(client: Socket, data: { text: any; to: string, from: string }) {
    console.log('handleChat', data);
    
    this.server.in(data.to).emit('chat-message', { text: data.text, from: data.from });
  }


  @SubscribeMessage('ice-candidate')
  handleIceCandidate(client: Socket, data: { candidate: any; to: string }) {
    client.to(data.to).emit('ice-candidate', { candidate: data.candidate, from: client.id });
  }

  private leaveRoom(client: Socket, roomId?: string) {
    const userRooms = Array.from(client.rooms).filter(room => room !== client.id);
    
    userRooms.forEach(room => {
      client.to(room).emit('user-disconnected', { userId: this.users.get(client.id) });
      client.leave(room);
      
      if (this.rooms.has(room)) {
        this.rooms.get(room).delete(client.id);
        if (this.rooms.get(room).size === 0) {
          this.rooms.delete(room);
        }
      }
    });
    
    this.users.delete(client.id);
  }
}