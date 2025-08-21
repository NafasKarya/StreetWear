/*
  Warnings:

  - You are about to drop the column `quantity` on the `CartItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cartId,productId,sizeLabel]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `price` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qty` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeLabel` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `CartItem` DROP COLUMN `quantity`,
    ADD COLUMN `price` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `qty` INTEGER NOT NULL,
    ADD COLUMN `sizeLabel` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `CartItem_cartId_productId_sizeLabel_key` ON `CartItem`(`cartId`, `productId`, `sizeLabel`);
