import { Body, Controller, Get, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Post('import')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async importFromFile(@UploadedFile() file: Express.Multer.File) {
    const data = await this.profileService.importFromFile(file);
    return { data };
  }
}
