import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsersCode1703352811971 implements MigrationInterface {
    name = 'UsersCode1703352811971';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" ADD "code" character varying`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "code"`);
    }
}
