import { Injectable, NotFoundException } from '@nestjs/common';
import { Video } from '@prisma/client';
import { VideoEntity } from './VideoEntity';
import { Prisma } from 'src/prisma/prisma.service';
import { CreateVideoDto } from './dto/createVideoDto';

@Injectable()
export class VideoService {
  constructor(private readonly prisma: Prisma) {}

  async createVideo(
    channelIdx: number,
    createVideoDto: CreateVideoDto,
    file: Express.Multer.File,
  ): Promise<VideoEntity> {
    const videoData = await this.prisma.video.create({
      data: {
        channelIdx: channelIdx,
        title: createVideoDto.title,
        content: createVideoDto.content,
        thumbnailImg: file.filename,
      },
    });

    return new VideoEntity(videoData);
  }

  async getVideoAll(channelIdx?: number): Promise<VideoEntity[]> {
    const videoData = await this.prisma.video.findMany({
      where: { channelIdx: channelIdx },
    });

    return videoData.map((elem) => new VideoEntity(elem));
  }

  async getVideoByIdx(videoIdx: number): Promise<VideoEntity> {
    const videoData = await this.prisma.video.findUnique({
      where: { idx: videoIdx },
    });

    console.log('videoData: ', videoData);

    if (!videoData) {
      throw new NotFoundException('Not Found Video');
    }

    return new VideoEntity(videoData);
  }
}
