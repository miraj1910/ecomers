/*
  Warnings:

  - Added the required column `updatedAt` to the `ProductInventory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductInventory" ADD COLUMN     "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "ProductInventory_stock_idx" ON "ProductInventory"("stock");
