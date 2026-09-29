import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  private isRunning = false;

  getStatus(): { running: boolean } {
    return { running: this.isRunning };
  }

  trigger(): { running: boolean; message: string } {
    if (this.isRunning) {
      throw new ConflictException('Scraper already running');
    }

    // process.cwd() is apps/api when started via turborepo — go up two levels
    const scraperDir =
      process.env.SCRAPER_DIR ?? path.resolve(process.cwd(), '../../apps/scraper');

    this.logger.log(`Starting scraper in ${scraperDir}`);
    this.isRunning = true;

    const isWin = process.platform === 'win32';
    const child = spawn(
      isWin ? 'cmd.exe' : 'sh',
      isWin ? ['/c', 'bun run scrape'] : ['-c', 'bun run scrape'],
      { cwd: scraperDir, stdio: 'pipe' },
    );

    child.stdout.on('data', (data: Buffer) => {
      this.logger.log(`[scraper] ${data.toString().trim()}`);
    });

    child.stderr.on('data', (data: Buffer) => {
      this.logger.warn(`[scraper] ${data.toString().trim()}`);
    });

    child.on('close', (code) => {
      this.isRunning = false;
      this.logger.log(`Scraper exited with code ${code}`);
    });

    child.on('error', (err) => {
      this.isRunning = false;
      this.logger.error(`Scraper process error: ${err.message}`);
    });

    return { running: true, message: 'Scraper iniciado' };
  }
}
