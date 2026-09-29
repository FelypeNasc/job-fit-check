import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateProfile } from './entities/candidate-profile.entity';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { OllamaModule } from '../ollama/ollama.module';

@Module({
  imports: [TypeOrmModule.forFeature([CandidateProfile]), OllamaModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
