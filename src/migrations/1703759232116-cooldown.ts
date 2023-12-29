import { MigrationInterface, QueryRunner } from "typeorm";

export class Cooldown1703759232116 implements MigrationInterface {
    name = 'Cooldown1703759232116'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "end-users" ADD "cooldownStart" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "end-users" DROP COLUMN "cooldownStart"`);
    }

}
