import { MigrationInterface, QueryRunner } from "typeorm";

export class EndUser1703692405094 implements MigrationInterface {
    name = 'EndUser1703692405094'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "end-users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "eventId" uuid, CONSTRAINT "PK_8cfa374209202e2c47ba28ba901" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "end-users" ADD CONSTRAINT "FK_5882a7c9be3373b5e5140f60bdb" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "end-users" DROP CONSTRAINT "FK_5882a7c9be3373b5e5140f60bdb"`);
        await queryRunner.query(`DROP TABLE "end-users"`);
    }

}
