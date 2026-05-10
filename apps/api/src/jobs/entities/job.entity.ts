import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { JobStatus } from '@job-analyzer/shared';
import { JobAnalysis } from './job-analysis.entity';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'linkedin_id', type: 'varchar', unique: true })
  linkedinId: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  company: string;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar' })
  url: string;

  @Column({ name: 'is_easy_apply', type: 'boolean', default: false })
  isEasyApply: boolean;

  @Column({ name: 'posted_at', type: 'timestamp', nullable: true })
  postedAt: Date | null;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.PENDING_ANALYSIS })
  status: JobStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToOne(() => JobAnalysis, (analysis) => analysis.job, { nullable: true })
  analysis: JobAnalysis | null;
}
