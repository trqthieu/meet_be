import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MeetingGateway } from './websocket/meeting.gateway';
import { AuthModule } from './auth/auth.module';
import { MeetingsModule } from './meetings/meetings.module';

@Module({
  imports: [MeetingsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, MeetingGateway],
})
export class AppModule {}
