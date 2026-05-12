import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OllamaService } from './ollama.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        baseURL: config.get('OLLAMA_BASE_URL', 'http://localhost:11434'),
        timeout: 60000,
      }),
    }),
  ],
  providers: [OllamaService],
  exports: [OllamaService],
})
export class OllamaModule {}
