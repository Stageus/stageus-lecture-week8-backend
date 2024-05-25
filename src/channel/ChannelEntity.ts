export class ChannelEntity {
  public idx: number;
  public name: string;
  public description: string;
  public profileImg?: string;
  public createdAt: Date;

  constructor(data: ChannelEntity) {
    this.idx = data.idx;
    this.name = data.name;
    this.description = data.description;
    this.profileImg = data.profileImg;
    this.createdAt = data.createdAt;
  }
}
