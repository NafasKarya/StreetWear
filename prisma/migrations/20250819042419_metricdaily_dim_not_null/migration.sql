/*
  Warnings:

  - Made the column `dim` on table `MetricDaily` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `MetricDaily` MODIFY `dim` VARCHAR(191) NOT NULL DEFAULT '';
