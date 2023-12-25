import { MigrationInterface, QueryRunner } from "typeorm";

export class DeviceId1703454295174 implements MigrationInterface {
    name = 'DeviceId1703454295174'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "deviceId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deviceId"`);
    }

}
