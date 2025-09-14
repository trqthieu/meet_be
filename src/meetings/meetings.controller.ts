import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createMeeting(@Body() meetingData: { title: string; createdBy: string }) {
    return this.meetingsService.createMeeting(meetingData);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getMeeting(@Param('id') id: string) {
    return this.meetingsService.getMeeting(id);
  }
}