import { MigrationInterface, QueryRunner } from "typeorm";

export class AccessTokenRefreshToken1703450102280 implements MigrationInterface {
    name = 'AccessTokenRefreshToken1703450102280'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "refreshToken" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "accessToken" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "accessToken"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refreshToken"`);
    }

}
