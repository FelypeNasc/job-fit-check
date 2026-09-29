import { Controller, Get, Post } from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get('status')
  getStatus() {
    return { data: this.scraperService.getStatus() };
  }

  @Post('trigger')
  trigger() {
    return { data: this.scraperService.trigger() };
  }
}
