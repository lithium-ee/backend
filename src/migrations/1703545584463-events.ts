import { MigrationInterface, QueryRunner } from 'typeorm';

export class Events1703545584463 implements MigrationInterface {
    name = 'Events1703545584463';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "device" json NOT NULL, "cooldown" integer NOT NULL, "filterSongs" boolean NOT NULL, "userId" uuid, CONSTRAINT "REL_9929fa8516afa13f87b41abb26" UNIQUE ("userId"), CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "events" ADD CONSTRAINT "FK_9929fa8516afa13f87b41abb263" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "events" DROP CONSTRAINT "FK_9929fa8516afa13f87b41abb263"`,
        );
        await queryRunner.query(`DROP TABLE "events"`);
    }
}
