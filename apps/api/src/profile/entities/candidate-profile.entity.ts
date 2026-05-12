import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('candidate_profiles')
export class CandidateProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  location: string;

  @Column({ type: 'varchar' })
  level: string;

  @Column({ name: 'core_stack', type: 'text', array: true })
  coreStack: string[];

  @Column({ name: 'secondary_stack', type: 'text', array: true })
  secondaryStack: string[];

  @Column({ name: 'not_experienced_with', type: 'text', array: true })
  notExperiencedWith: string[];

  @Column({ name: 'target_roles', type: 'text' })
  targetRoles: string;

  @Column({ type: 'text', array: true })
  languages: string[];

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
