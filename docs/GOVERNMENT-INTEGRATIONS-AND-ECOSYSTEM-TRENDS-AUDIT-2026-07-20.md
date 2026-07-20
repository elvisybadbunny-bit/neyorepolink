# Government integrations and Ecosystem Trends audit

## Finding

Four Founder Vault entries were presentation-only and had no service/API call sites:

- `kra_etims_api_key`
- `kra_etims_pin`
- `ntsa_fleet_api_key`
- `knec_sms_gateway_token`

Showing a configurable secret implied working integrations that did not exist.

## Correct ownership and status

### KRA eTIMS

KRA documents OSCU/VSCU system-to-system integration for taxpayers with invoicing systems. It involves taxpayer onboarding plus development, sandbox testing, vetting and certification for self-integrators or third-party vendors. A school’s taxpayer PIN and communication material are school-specific, not one NEYO-company global secret.

NEYO currently has school invoices but no certified eTIMS connector. Therefore the phantom global fields were removed rather than relocating a non-working integration. A future implementation belongs under each school’s Finance/Tax settings after NEYO has legitimate integration approval.

Official references:

- https://www.kra.go.ke/business/etims-electronic-tax-invoice-management-system/learn-about-etims/etims-system-to-system-integration
- https://etims.kra.go.ke/main/signup/indexLearnMore

### NTSA

NEYO’s real current capability is school-owned vehicle registration plus manually entered insurance and inspection-expiry dates with reminders. Public NTSA material reviewed did not establish the generic fleet inspection API key previously claimed by the vault. The phantom key was removed. Transport now states clearly that status comes from school-entered dates.

Reference: https://www.ntsa.go.ke/

### KNEC SMS/placement query

KNEC provides official result/query channels and has procured SMS/USSD services, but that does not establish a generic token issued to each school for NEYO to call. NEYO has no connector consuming the old token. It was removed. KNEC/MOE records remain manual or use the existing documented export/record workflows without claiming live government submission/query.

References:

- https://www.knec.ac.ke/services/release-results/
- https://www2.knec.ac.ke/faq/

## Data cleanup

Migration `20260720235900_remove_phantom_government_credentials` removes any previously stored unsupported values from the company vault.

## Future full-stack acceptance criteria

No government credential should reappear until all exist:

1. official access/legal basis;
2. correct owner (NEYO company or individual school);
3. tenant-specific consent where needed;
4. encrypted credential model;
5. real provider client;
6. API/service workflow;
7. audit history;
8. status/error/retry UI;
9. sandbox evidence;
10. production activation evidence.

## Ecosystem Trends

The tab was in the tab list but had no render branch, causing a blank page. It now renders six connected signal areas:

- school adoption;
- customer learning;
- product direction;
- learning content;
- revenue health;
- platform reliability.

Each card opens its relevant existing workspace. Counts remain honest zeros when no records exist.

## Founder refresh

The full text Refresh button was replaced with a 36px circular icon button with title and accessible label, saving mobile width without hiding meaning.
