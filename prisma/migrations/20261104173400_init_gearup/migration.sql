/*
  Warnings:

  - You are about to drop the column `categories` on the `gear_items` table. All the data in the column will be lost.
  - Added the required column `providerId` to the `gear_items` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GearStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'REMOVED');

-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('PLACED', 'CONFIRMED', 'PAID', 'PICKED_UP', 'RETURNED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- AlterTable
ALTER TABLE "gear_items" DROP COLUMN "categories",
ADD COLUMN     "brand" TEXT,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "providerId" TEXT NOT NULL,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "specifications" JSONB,
ADD COLUMN     "status" "GearStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "profiles" ALTER COLUMN "phoneNumber" DROP NOT NULL;

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "rentalOrderId" TEXT NOT NULL,
    "transactionId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "provider" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_orders" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "status" "RentalStatus" NOT NULL DEFAULT 'PLACED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rental_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_order_items" (
    "id" TEXT NOT NULL,
    "rentalOrderId" TEXT NOT NULL,
    "gearItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rental_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryToGearItem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CategoryToGearItem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transactionId_key" ON "payments"("transactionId");

-- CreateIndex
CREATE INDEX "payments_rentalOrderId_idx" ON "payments"("rentalOrderId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "rental_orders_customerId_key" ON "rental_orders"("customerId");

-- CreateIndex
CREATE INDEX "rental_orders_customerId_idx" ON "rental_orders"("customerId");

-- CreateIndex
CREATE INDEX "rental_orders_status_idx" ON "rental_orders"("status");

-- CreateIndex
CREATE UNIQUE INDEX "rental_order_items_rentalOrderId_gearItemId_key" ON "rental_order_items"("rentalOrderId", "gearItemId");

-- CreateIndex
CREATE INDEX "_CategoryToGearItem_B_index" ON "_CategoryToGearItem"("B");

-- CreateIndex
CREATE INDEX "gear_items_providerId_idx" ON "gear_items"("providerId");

-- CreateIndex
CREATE INDEX "gear_items_status_idx" ON "gear_items"("status");

-- AddForeignKey
ALTER TABLE "gear_items" ADD CONSTRAINT "gear_items_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_rentalOrderId_fkey" FOREIGN KEY ("rentalOrderId") REFERENCES "rental_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_orders" ADD CONSTRAINT "rental_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_order_items" ADD CONSTRAINT "rental_order_items_rentalOrderId_fkey" FOREIGN KEY ("rentalOrderId") REFERENCES "rental_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_order_items" ADD CONSTRAINT "rental_order_items_gearItemId_fkey" FOREIGN KEY ("gearItemId") REFERENCES "gear_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToGearItem" ADD CONSTRAINT "_CategoryToGearItem_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToGearItem" ADD CONSTRAINT "_CategoryToGearItem_B_fkey" FOREIGN KEY ("B") REFERENCES "gear_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
