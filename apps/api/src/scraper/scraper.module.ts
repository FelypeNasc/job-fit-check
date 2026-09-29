import { Module } from '@nestjs/common';
import { AnalysisModule } from '../analysis/analysis.module';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';

@Module({
  imports: [AnalysisModule],
  controllers: [ScraperController],
  providers: [ScraperService],
})
export class ScraperModule {}
