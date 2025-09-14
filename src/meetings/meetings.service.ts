import { Injectable } from '@nestjs/common';

export interface Meeting {
  id: string;
  title: string;
  createdBy: string;
  createdAt: Date;
  participants: string[];
}

@Injectable()
export class MeetingsService {
  private meetings: Map<string, Meeting> = new Map();

  createMeeting(meetingData: { title: string; createdBy: string }): Meeting {
    const id = this.generateMeetingId();
    const meeting: Meeting = {
      id,
      title: meetingData.title,
      createdBy: meetingData.createdBy,
      createdAt: new Date(),
      participants: [meetingData.createdBy],
    };
    
    this.meetings.set(id, meeting);
    return meeting;
  }

  getMeeting(id: string): Meeting | undefined {
    return this.meetings.get(id);
  }

  addParticipant(meetingId: string, participant: string): boolean {
    const meeting = this.meetings.get(meetingId);
    if (meeting && !meeting.participants.includes(participant)) {
      meeting.participants.push(participant);
      return true;
    }
    return false;
  }

  removeParticipant(meetingId: string, participant: string): boolean {
    const meeting = this.meetings.get(meetingId);
    if (meeting) {
      const index = meeting.participants.indexOf(participant);
      if (index > -1) {
        meeting.participants.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  private generateMeetingId(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}