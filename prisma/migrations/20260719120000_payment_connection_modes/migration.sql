-- Extend school payment setup without removing existing Daraja credentials.
-- Existing configured schools remain STK Paybill setups, but are honestly marked untested.
ALTER TABLE "PaymentCredential"
  ADD COLUMN "connectionMode" TEXT NOT NULL DEFAULT 'STK_PAYBILL',
  ADD COLUMN "shortcodeType" TEXT NOT NULL DEFAULT 'PAYBILL',
  ADD COLUMN "connectionStatus" TEXT NOT NULL DEFAULT 'SAVED_NOT_TESTED',
  ADD COLUMN "accountReferenceFormat" TEXT;
