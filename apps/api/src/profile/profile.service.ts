import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExtractedProfileInput } from '@jobfitcheck/shared';
import { CandidateProfile } from './entities/candidate-profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { OllamaService } from '../ollama/ollama.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(CandidateProfile)
    private readonly profileRepository: Repository<CandidateProfile>,
    private readonly ollamaService: OllamaService,
  ) {}

  async getProfile(): Promise<CandidateProfile> {
    const profile = await this.profileRepository.findOne({ where: {} });
    if (!profile) {
      throw new NotFoundException('No profile found. Create one via the profile page.');
    }
    return profile;
  }

  async updateProfile(dto: UpdateProfileDto): Promise<CandidateProfile> {
    const profile = await this.getProfile();
    Object.assign(profile, dto);
    return this.profileRepository.save(profile);
  }

  async importFromFile(file: Express.Multer.File): Promise<ExtractedProfileInput> {
    const isPdf = file.mimetype === 'application/pdf';
    const isDocx = file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (!isPdf && !isDocx) {
      throw new BadRequestException('Only PDF and DOCX files are supported');
    }

    let rawText: string;

    if (isPdf) {
      const pdfParse = (await import('pdf-parse')).default;
      const result = await pdfParse(file.buffer);
      rawText = result.text;
    } else {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      rawText = result.value;
    }

    if (!rawText.trim()) {
      throw new BadRequestException('Could not extract text from the uploaded file');
    }

    return this.ollamaService.extractProfile(rawText);
  }
}
