import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1760030709571 implements MigrationInterface {
  name = 'InitSchema1760030709571';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "harvests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "data" date NOT NULL, "peso_kg" numeric(10,2) NOT NULL, "qualidade" character varying, "plotId" uuid NOT NULL, CONSTRAINT "PK_fb748ae28bc0000875b1949a0a6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c57b86324be05bb6799b661731" ON "harvests" ("data") `,
    );
    await queryRunner.query(
      `CREATE TABLE "plots" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying NOT NULL, "area_m2" numeric(10,2) NOT NULL, "inicio_plantio" date, CONSTRAINT "UQ_413262e32373f36bc3ba7ea1d34" UNIQUE ("nome"), CONSTRAINT "PK_ba7eaba496503e69206deae9363" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvests" ADD CONSTRAINT "FK_3c0fed5b89dffe90b768e65f726" FOREIGN KEY ("plotId") REFERENCES "plots"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "harvests" DROP CONSTRAINT "FK_3c0fed5b89dffe90b768e65f726"`,
    );
    await queryRunner.query(`DROP TABLE "plots"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c57b86324be05bb6799b661731"`,
    );
    await queryRunner.query(`DROP TABLE "harvests"`);
  }
}
