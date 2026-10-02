import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkplaceTypeAndExperienceLevel1746200000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "jobs"
        ADD COLUMN IF NOT EXISTS "workplace_type"   VARCHAR(100),
        ADD COLUMN IF NOT EXISTS "experience_level" VARCHAR(100)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN IF EXISTS "workplace_type"`);
    await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN IF EXISTS "experience_level"`);
  }
}
