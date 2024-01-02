import { MigrationInterface, QueryRunner } from "typeorm";

export class Nullable1704225270706 implements MigrationInterface {
    name = 'Nullable1704225270706'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "device" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "device" SET NOT NULL`);
    }

}
