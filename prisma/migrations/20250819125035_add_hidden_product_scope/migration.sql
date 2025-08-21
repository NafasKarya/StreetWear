-- AlterTable
ALTER TABLE `Product` ADD COLUMN `hiddenScope` VARCHAR(191) NULL,
    ADD COLUMN `isHidden` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `Product_isHidden_idx` ON `Product`(`isHidden`);

-- CreateIndex
CREATE INDEX `Product_hiddenScope_idx` ON `Product`(`hiddenScope`);
