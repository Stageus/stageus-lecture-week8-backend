import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { ChannelModule } from 'src/channel/channel.module';

@Module({
  imports: [PrismaModule, AuthModule, ChannelModule],
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule {}
