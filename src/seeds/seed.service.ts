import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}

  async createAdmin() {
    const email = this.configService.get<string>('ADMIN_EMAIL');
    const password = this.configService.get<string>('ADMIN_PASSWORD');
    const name = 'Administrator';

    const existing = await this.userModel.findOne({ email });
    if (existing) {
      this.logger.warn(`Admin already exists with email: ${email}`);
      return;
    }

    const hashed = await bcrypt.hash(password, 10);

    const admin = new this.userModel({
      email,
      password: hashed,
      name,
      role: UserRole.ADMIN,
    });

    await admin.save();
    this.logger.log(`Admin created with email: ${email}`);
  }
}
