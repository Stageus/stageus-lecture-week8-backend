import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SignUpDto } from './dto/SignUpDto';
import { Prisma } from 'src/prisma/prisma.service';
import { ChannelEntity } from './ChannelEntity';
import * as bcrypt from 'bcryptjs';
import { LoginUser } from 'src/auth/model/login-user.model';

@Injectable()
export class ChannelService {
  constructor(private readonly prisma: Prisma) {}

  async signUp(signUpDto: SignUpDto): Promise<void> {
    const idDuplicatedChannel = await this.prisma.channel.findMany({
      where: { id: signUpDto.id },
    });

    if (idDuplicatedChannel.length > 0) {
      throw new ConflictException('id duplicated');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(signUpDto.pw, salt);

    await this.prisma.channel.create({
      data: { id: signUpDto.id, pw: hashedPassword, name: signUpDto.name },
    });
  }

  async getMyInfo(loginUser: LoginUser): Promise<ChannelEntity> {
    let channel = await this.getChannelByIdx(loginUser.idx);

    if (!channel) {
      throw new NotFoundException('Not Found Channel');
    }

    const channelData = await this.prisma.channel.findUnique({
      where: { idx: loginUser.idx },
    });

    return new ChannelEntity(channelData);
  }

  async updateMyProfileImg(
    userIdx: number,
    file: Express.Multer.File,
  ): Promise<{ profileImg: string }> {
    let channel = await this.getChannelByIdx(userIdx);

    if (!channel) {
      throw new NotFoundException('Not Found Channel');
    }

    channel = await this.prisma.channel.update({
      where: { idx: userIdx },
      data: {
        profileImg: file.filename,
      },
    });

    return { profileImg: channel.profileImg };
  }

  async createSubscribe(userIdx: number, channelIdx: number): Promise<void> {
    const subscribeState = await this.getSubscrbeState(userIdx, channelIdx);

    if (subscribeState) {
      throw new ConflictException('alreay subscribe');
    }

    await this.prisma.subscribe.create({
      data: { subscriber: userIdx, provider: channelIdx },
    });
  }

  async deleteSubscribeByIdx(
    userIdx: number,
    channelIdx: number,
  ): Promise<void> {
    const subscribeState = await this.getSubscrbeState(userIdx, channelIdx);

    if (!subscribeState) {
      throw new ConflictException('alreay subscribe');
    }

    await this.prisma.subscribe.deleteMany({
      where: { subscriber: userIdx, provider: channelIdx },
    });
  }

  async getSubscribeAll(channelIdx: number): Promise<ChannelEntity[]> {
    const providerList = await this.prisma.subscribe.findMany({
      where: {
        subscriber: channelIdx,
      },
    });

    const channelList = await this.prisma.channel.findMany({
      where: {
        idx: {
          in: providerList.map((elem) => elem.provider),
        },
      },
    });

    return channelList.map((elem) => new ChannelEntity(elem));
  }

  async getChannelByIdx(channelIdx: number): Promise<ChannelEntity> {
    const channelData = await this.prisma.channel.findUnique({
      where: { idx: channelIdx },
    });

    if (!channelData) {
      throw new NotFoundException('Not Found Channel');
    }

    return new ChannelEntity(channelData);
  }

  async getSubscrbeState(
    subscriberIdx: number,
    providerIdx: number,
  ): Promise<boolean> {
    const subscribeState = await this.prisma.subscribe.findUnique({
      where: {
        subscriber_provider: {
          subscriber: subscriberIdx,
          provider: providerIdx,
        },
      },
    });

    if (!subscribeState) {
      return false;
    }

    return true;
  }
}
