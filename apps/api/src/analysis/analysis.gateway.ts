import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: 'http://localhost:3000' }, namespace: '/analysis' })
export class AnalysisGateway {
  @WebSocketServer()
  private readonly server: Server;

  notifyQueued(count: number): void {
    this.server.emit('analysis:queued', { count });
  }

  notifyStarted(jobId: string, title: string, company: string): void {
    this.server.emit('analysis:started', { jobId, title, company });
  }

  notifyCompleted(jobId: string, title: string, fitScore: number, recommendation: string): void {
    this.server.emit('analysis:completed', { jobId, title, fitScore, recommendation });
  }

  notifyFailed(jobId: string): void {
    this.server.emit('analysis:failed', { jobId });
  }
}
