import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCandidateProfileTable1746100000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "candidate_profiles" (
        "id"                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name"                  VARCHAR(255) NOT NULL,
        "location"              VARCHAR(255) NOT NULL,
        "level"                 VARCHAR(100) NOT NULL,
        "core_stack"            TEXT[] NOT NULL DEFAULT '{}',
        "secondary_stack"       TEXT[] NOT NULL DEFAULT '{}',
        "not_experienced_with"  TEXT[] NOT NULL DEFAULT '{}',
        "target_roles"          TEXT NOT NULL,
        "languages"             TEXT[] NOT NULL DEFAULT '{}',
        "updated_at"            TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      INSERT INTO "candidate_profiles" (
        "name", "location", "level",
        "core_stack", "secondary_stack", "not_experienced_with",
        "target_roles", "languages"
      ) VALUES (
        'CANDIDATE_NAME',
        'CANDIDATE_LOCATION',
        'YOUR_LEVEL',
        ARRAY['Node.js', 'NestJS', 'TypeScript', 'PostgreSQL', 'TypeORM', 'React', 'Vue.js'],
        ARRAY['Python', 'React Native', 'Playwright', 'Jest', 'Git', 'Google Cloud (Pub/Sub, Cloud Scheduler)'],
        ARRAY['Java', 'Kubernetes', 'AWS', 'GraphQL', 'Elasticsearch'],
        'Remote roles (Brazil or global), Backend or Fullstack, Mid to Senior level',
        ARRAY['Portuguese (native)', 'English (professional proficiency)']
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "candidate_profiles"`);
  }
}
