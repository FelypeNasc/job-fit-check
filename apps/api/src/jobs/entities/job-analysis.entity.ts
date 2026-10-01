import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LevelMatch, Recommendation } from '@jobfitcheck/shared';
import { Job } from './job.entity';

@Entity('job_analyses')
export class JobAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Job, (job) => job.analysis)
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column({ name: 'fit_score', type: 'int' })
  fitScore: number;

  @Column({ name: 'matching_skills', type: 'text', array: true })
  matchingSkills: string[];

  @Column({ name: 'missing_skills', type: 'text', array: true })
  missingSkills: string[];

  @Column({ name: 'location_ok', type: 'boolean' })
  locationOk: boolean;

  @Column({ name: 'level_match', type: 'enum', enum: LevelMatch })
  levelMatch: LevelMatch;

  @Column({ type: 'text' })
  summary: string;

  @Column({ name: 'cover_letter', type: 'text', nullable: true })
  coverLetter: string | null;

  @Column({ name: 'deal_breakers', type: 'text', array: true })
  dealBreakers: string[];

  @Column({ type: 'enum', enum: Recommendation })
  recommendation: Recommendation;

  @CreateDateColumn({ name: 'analyzed_at' })
  analyzedAt: Date;
}
