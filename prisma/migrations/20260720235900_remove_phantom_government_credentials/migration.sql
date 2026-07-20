-- These keys were exposed in the company-global vault but had no connector
-- consuming them. KRA taxpayer credentials are school-specific and require a
-- certified OSCU/VSCU integration; no verified NTSA/KNEC token connector exists.
DELETE FROM "NeyoIntegrationSecret"
WHERE "key" IN ('kra_etims_api_key', 'kra_etims_pin', 'ntsa_fleet_api_key', 'knec_sms_gateway_token');
