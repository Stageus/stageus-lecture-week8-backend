import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateVideoDto } from './dto/createVideoDto';
import { VideoService } from './video.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/configs/multerOption';
import { GetUser } from 'src/auth/get-user.decorator';
import { LoginUser } from 'src/auth/model/login-user.model';
import { VideoEntity } from './VideoEntity';
import { VideoPagerbleDto } from './dto/VideoPagerbleDto';
import { ChannelService } from 'src/channel/channel.service';

@Controller('video')
export class VideoController {
  constructor(
    private videoService: VideoService,
    private channelService: ChannelService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async createVideo(
    @GetUser() loginUser: LoginUser,
    @Body() createVideoDto: CreateVideoDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<VideoEntity> {
    if (!file) {
      throw new BadRequestException('No image file');
    }

    return await this.videoService.createVideo(
      loginUser.idx,
      createVideoDto,
      file,
    );
  }

  @Get('/all')
  async getVideoAll(
    @Query() pagerble: VideoPagerbleDto,
  ): Promise<VideoEntity[]> {
    return await this.videoService.getVideoAll(pagerble.channel);
  }

  @Get(':videoIdx')
  async getVideoByIdx(
    @Param('videoIdx', ParseIntPipe) videoIdx: number,
  ): Promise<{
    video: VideoEntity;
    channel: { channelIdx: number; name: string; profileImg: string };
  }> {
    const VideoEntity = await this.videoService.getVideoByIdx(videoIdx);

    const channel = await this.channelService.getChannelByIdx(
      VideoEntity.channelIdx,
    );
    return {
      video: VideoEntity,
      channel: {
        channelIdx: channel.idx,
        name: channel.name,
        profileImg: channel.profileImg,
      },
    };
  }
}
