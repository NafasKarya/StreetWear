-- CreateTable
CREATE TABLE `checkout` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderRef` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `checkout_orderRef_key`(`orderRef`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `checkout_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `checkoutId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `sizeLabel` VARCHAR(64) NOT NULL,
    `qty` INTEGER NOT NULL,
    `price` DOUBLE NULL,
    `currency` VARCHAR(8) NULL,
    `snapshot` JSON NULL,

    INDEX `checkout_item_productId_idx`(`productId`),
    INDEX `checkout_item_checkoutId_idx`(`checkoutId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `checkout_item` ADD CONSTRAINT `checkout_item_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkout_item` ADD CONSTRAINT `checkout_item_checkoutId_fkey` FOREIGN KEY (`checkoutId`) REFERENCES `checkout`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
