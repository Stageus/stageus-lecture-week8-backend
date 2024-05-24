import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/LoginDto';
import { Prisma } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ChannelEntity } from 'src/channel/ChannelEntity';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: Prisma,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const channel = await this.prisma.channel.findFirst({
      where: { id: loginDto.id },
    });

    console.log(channel);

    if (!channel) {
      throw new UnauthorizedException('login failed');
    }

    if (!(await bcrypt.compare(loginDto.pw, channel.pw))) {
      throw new UnauthorizedException('login failed');
    }

    const accessToken = this.jwtService.sign({ idx: channel.idx });
    return { accessToken: accessToken };
  }
}
