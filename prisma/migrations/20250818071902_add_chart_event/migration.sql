-- CreateTable
CREATE TABLE `ChartEvent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('PAGE_VIEW', 'PRODUCT_VIEW', 'ADD_TO_CART', 'REMOVE_FROM_CART', 'CHECKOUT_CREATED', 'CHECKOUT_ITEM') NOT NULL,
    `productId` INTEGER NULL,
    `sizeLabel` VARCHAR(191) NULL,
    `qty` INTEGER NULL,
    `amount` DECIMAL(65, 30) NULL,
    `currency` VARCHAR(191) NULL,
    `sessionId` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MetricDaily` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `metric` VARCHAR(191) NOT NULL,
    `value` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `dim` VARCHAR(191) NULL,
    `extra` JSON NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MetricDaily_date_metric_idx`(`date`, `metric`),
    UNIQUE INDEX `MetricDaily_date_metric_dim_key`(`date`, `metric`, `dim`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
