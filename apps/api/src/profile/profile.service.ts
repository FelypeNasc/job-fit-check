import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidateProfile } from './entities/candidate-profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(CandidateProfile)
    private readonly profileRepository: Repository<CandidateProfile>,
  ) {}

  async getProfile(): Promise<CandidateProfile> {
    const profile = await this.profileRepository.findOne({ where: {} });
    if (!profile) {
      throw new NotFoundException('Candidate profile not found. Run migrations to seed the default profile.');
    }
    return profile;
  }

  async updateProfile(dto: UpdateProfileDto): Promise<CandidateProfile> {
    const profile = await this.getProfile();
    Object.assign(profile, dto);
    return this.profileRepository.save(profile);
  }
}
