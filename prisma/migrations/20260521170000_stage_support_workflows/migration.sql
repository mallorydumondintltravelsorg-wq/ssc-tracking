-- Add nullable support ownership/management fields without disturbing existing tickets.
ALTER TABLE "SupportTicket"
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "userId" TEXT,
ADD COLUMN IF NOT EXISTS "userName" TEXT,
ADD COLUMN IF NOT EXISTS "userEmail" TEXT;

-- Real shipment stage history controlled by admins.
CREATE TABLE IF NOT EXISTS "ShipmentStage" (
  "id" TEXT NOT NULL,
  "shipmentId" TEXT NOT NULL,
  "stage" TEXT NOT NULL,
  "sequence" INTEGER NOT NULL,
  "achievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "location" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShipmentStage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ShipmentStage_shipmentId_sequence_idx"
ON "ShipmentStage"("shipmentId", "sequence");

ALTER TABLE "ShipmentStage"
DROP CONSTRAINT IF EXISTS "ShipmentStage_shipmentId_fkey";

ALTER TABLE "ShipmentStage"
ADD CONSTRAINT "ShipmentStage_shipmentId_fkey"
FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Threaded support conversation messages for user/admin communication.
CREATE TABLE IF NOT EXISTS "SupportMessage" (
  "id" TEXT NOT NULL,
  "ticketId" TEXT NOT NULL,
  "senderId" TEXT,
  "senderName" TEXT NOT NULL,
  "senderRole" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SupportMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SupportMessage_ticketId_createdAt_idx"
ON "SupportMessage"("ticketId", "createdAt");

ALTER TABLE "SupportMessage"
DROP CONSTRAINT IF EXISTS "SupportMessage_ticketId_fkey";

ALTER TABLE "SupportMessage"
ADD CONSTRAINT "SupportMessage_ticketId_fkey"
FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
