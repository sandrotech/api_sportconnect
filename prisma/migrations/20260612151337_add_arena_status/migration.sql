-- CreateEnum
CREATE TYPE "ArenaStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Arena" ADD COLUMN     "status" "ArenaStatus" NOT NULL DEFAULT 'PENDING';
