import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AnalysisService } from '../analysis/analysis.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['log', 'warn', 'error'] });

  const analysisService = app.get(AnalysisService);
  const count = await analysisService.queueAllPending();

  console.log(`Queued ${count} pending job(s) for analysis.`);

  if (count === 0) {
    await app.close();
    process.exit(0);
  }

  // Wait for queue to drain before exiting
  const { Queue } = await import('bullmq');
  const queue = new Queue('job-analysis', {
    connection: {
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number(process.env.REDIS_PORT ?? 6379),
    },
  });

  const pollInterval = 3000;
  const timeout = 30 * 60 * 1000; // 30 minutes
  const start = Date.now();

  await new Promise<void>((resolve, reject) => {
    const check = setInterval(async () => {
      try {
        const waiting = await queue.getWaitingCount();
        const active = await queue.getActiveCount();
        console.log(`Queue status — waiting: ${waiting}, active: ${active}`);

        if (waiting === 0 && active === 0) {
          clearInterval(check);
          resolve();
        }

        if (Date.now() - start > timeout) {
          clearInterval(check);
          reject(new Error('Timed out waiting for queue to drain'));
        }
      } catch (err) {
        clearInterval(check);
        reject(err);
      }
    }, pollInterval);
  });

  await queue.close();
  await app.close();
  console.log('All analyses complete.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Analyze command failed:', err);
  process.exit(1);
});
