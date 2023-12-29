import { MigrationInterface, QueryRunner } from "typeorm";

export class SongsUpdate1703850214049 implements MigrationInterface {
    name = 'SongsUpdate1703850214049'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "songs" ADD "title" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "songs" ADD "artists" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "songs" ADD "pushedToSpotify" boolean NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "songs" DROP COLUMN "pushedToSpotify"`);
        await queryRunner.query(`ALTER TABLE "songs" DROP COLUMN "artists"`);
        await queryRunner.query(`ALTER TABLE "songs" DROP COLUMN "title"`);
    }

}
