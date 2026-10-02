import { Body, Controller, Get, Post } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { TriggerScraperDto } from './dto/trigger-scraper.dto';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get('status')
  getStatus() {
    return { data: this.scraperService.getStatus() };
  }

  @Post('trigger')
  trigger(@Body() body: TriggerScraperDto) {
    return { data: this.scraperService.trigger(body) };
  }
}
