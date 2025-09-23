// server/src/auth/dto/register.dto.ts
import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty() @IsString() @MinLength(3) @MaxLength(30) username: string;
  @ApiProperty() @IsString() @MinLength(6) @MaxLength(64) password: string;
  @ApiProperty({ required: false }) @IsString() displayName?: string;
}


