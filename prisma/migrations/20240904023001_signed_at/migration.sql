-- AlterTable
ALTER TABLE "Agreements" ALTER COLUMN "signedAt" DROP NOT NULL,
ALTER COLUMN "signedAt" DROP DEFAULT;
