import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateJobsTables1746000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "job_status_enum" AS ENUM (
        'pending_analysis',
        'analyzed',
        'applied',
        'rejected',
        'saved'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "level_match_enum" AS ENUM ('under', 'match', 'over')
    `);

    await queryRunner.query(`
      CREATE TYPE "recommendation_enum" AS ENUM ('apply', 'maybe', 'skip')
    `);

    await queryRunner.query(`
      CREATE TABLE "jobs" (
        "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "linkedin_id"   VARCHAR(50) UNIQUE NOT NULL,
        "title"         VARCHAR(255) NOT NULL,
        "company"       VARCHAR(255) NOT NULL,
        "location"      VARCHAR(255),
        "description"   TEXT NOT NULL,
        "url"           VARCHAR(500) NOT NULL,
        "is_easy_apply" BOOLEAN NOT NULL DEFAULT false,
        "posted_at"     TIMESTAMP,
        "status"        "job_status_enum" NOT NULL DEFAULT 'pending_analysis',
        "created_at"    TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "job_analyses" (
        "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "job_id"           UUID NOT NULL REFERENCES "jobs"("id") ON DELETE CASCADE,
        "fit_score"        INTEGER NOT NULL CHECK (fit_score BETWEEN 0 AND 100),
        "matching_skills"  TEXT[] NOT NULL DEFAULT '{}',
        "missing_skills"   TEXT[] NOT NULL DEFAULT '{}',
        "location_ok"      BOOLEAN NOT NULL,
        "level_match"      "level_match_enum" NOT NULL,
        "summary"          TEXT NOT NULL,
        "cover_letter"     TEXT,
        "deal_breakers"    TEXT[] NOT NULL DEFAULT '{}',
        "recommendation"   "recommendation_enum" NOT NULL,
        "analyzed_at"      TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "job_analyses"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "jobs"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "recommendation_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "level_match_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "job_status_enum"`);
  }
}
