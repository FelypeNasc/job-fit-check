import { Body, Controller, Get, Put } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile() {
    const data = await this.profileService.getProfile();
    return { data };
  }

  @Put()
  async updateProfile(@Body() dto: UpdateProfileDto) {
    const data = await this.profileService.updateProfile(dto);
    return { data };
  }
}
