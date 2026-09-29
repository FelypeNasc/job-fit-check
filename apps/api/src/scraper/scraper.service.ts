import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
import { AnalysisService } from '../analysis/analysis.service';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  private isRunning = false;

  constructor(private readonly analysisService: AnalysisService) {}

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
      if (code === 0) {
        this.analysisService.queueAllPending().then((count) => {
          this.logger.log(`Queued ${count} jobs for analysis`);
        }).catch((err: Error) => {
          this.logger.error(`Failed to queue jobs: ${err.message}`);
        });
      }
    });

    child.on('error', (err) => {
      this.isRunning = false;
      this.logger.error(`Scraper process error: ${err.message}`);
    });

    return { running: true, message: 'Scraper iniciado' };
  }
}
