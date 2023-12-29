import { MigrationInterface, QueryRunner } from "typeorm";

export class Songs1703850101652 implements MigrationInterface {
    name = 'Songs1703850101652'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "songs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "spotifyId" character varying NOT NULL, "endUserId" uuid, CONSTRAINT "PK_e504ce8ad2e291d3a1d8f1ea2f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "songs" ADD CONSTRAINT "FK_6034bf9616ae0c49a718a193323" FOREIGN KEY ("endUserId") REFERENCES "end-users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "songs" DROP CONSTRAINT "FK_6034bf9616ae0c49a718a193323"`);
        await queryRunner.query(`DROP TABLE "songs"`);
    }

}
