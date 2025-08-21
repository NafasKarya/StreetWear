/*
  Warnings:

  - You are about to drop the column `used` on the `AccessCode` table. All the data in the column will be lost.
  - You are about to alter the column `tokenHash` on the `AccessCode` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(64)`.

*/
-- AlterTable
ALTER TABLE `AccessCode` DROP COLUMN `used`,
    ADD COLUMN `usedCount` INTEGER NOT NULL DEFAULT 0,
    MODIFY `tokenHash` CHAR(64) NOT NULL;
