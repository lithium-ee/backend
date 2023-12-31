import { MigrationInterface, QueryRunner } from "typeorm";

export class Cooldownend1704017650217 implements MigrationInterface {
    name = 'Cooldownend1704017650217'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "end-users" ADD "cooldownEnd" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "end-users" DROP COLUMN "cooldownEnd"`);
    }

}
