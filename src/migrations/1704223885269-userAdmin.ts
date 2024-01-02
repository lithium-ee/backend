import { MigrationInterface, QueryRunner } from "typeorm";

export class UserAdmin1704223885269 implements MigrationInterface {
    name = 'UserAdmin1704223885269'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "isAdmin" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isAdmin"`);
    }

}
