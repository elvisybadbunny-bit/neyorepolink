# 🔑 Founder's Guide to NEYO Ops Integration Credentials & Secrets Vault

> **For the Solo Founder (company: NEYO)**  
> **Location in Product:** Nav → NEYO Ops (`/founder`) → Tab: **`Credentials & Secrets Vault`**  
> **Security Guarantee:** All secrets are encrypted at rest using **AES-256-GCM** with the master key (`NEYO_MASTER_KEK`) before hitting the PostgreSQL database. No plaintext API keys or passwords are ever exposed to schools, staff, or log files.

---

## 🧭 Overview & Core Principle

In NEYO, **features and integrations never hardcode API keys, passkeys, or vendor credentials**. Everything is powered dynamically by your central **NEYO Ops Credentials & Secrets Vault**.

Whenever you obtain a new API key, OAuth secret, or payment credential from an external provider (Safaricom Daraja, Africa's Talking, Google Cloud, AWS, KRA, NTSA, etc.), you simply log into **NEYO Ops (`/founder`)**, navigate to **`Credentials & Secrets Vault`**, search for the key, and click **`Edit Key`** to paste it in.

The moment you click **Save Credential to Vault**, the system automatically encrypts the key and makes it instantly live across all 100% full-stack NEYO modules!

---

## 📋 Comprehensive Catalog of All Integration Credentials in NEYO

Below is the complete list of parameter keys managed inside your vault, organized by service domain:

### 1. M-Pesa Daraja Central Payment Gateway (`CENTRAL_DARAJA`)
Powers automatic M-Pesa STK Pushes, Paybill reconciliations, and fee collection across all schools.

| Vault Parameter Key | Type | Description / Provider Guide |
| :--- | :---: | :--- |
| `central_daraja_shortcode` | Public | Your main Safaricom Business Shortcode / Paybill Number (e.g. `522533`). |
| `central_daraja_environment` | Public | Set to `sandbox` during testing or `production` for real M-Pesa payments. |
| `central_daraja_consumer_key` | Secret | Daraja Developer App Consumer Key obtained from Safaricom Developer Portal. |
| `central_daraja_consumer_secret` | Secret | Daraja Developer App Consumer Secret. |
| `central_daraja_passkey` | Secret | Online Passkey provided by Safaricom for STK Push initiation. |

---

### 2. SMS & Email Communication Seams (`SMS` / `EMAIL`)
Powers automated parent SMS fee reminders, substitute teacher alerts, emergency discipline alerts, and email notifications.

| Vault Parameter Key | Type | Description / Provider Guide |
| :--- | :---: | :--- |
| `africas_talking_api_key` | Secret | Live API Key from Africa's Talking Developer Dashboard. |
| `africas_talking_username` | Public | Your Africa's Talking account username (e.g. `sandbox` or `neyo_live`). |
| `africas_talking_sender_id` | Public | Registered Sender ID (e.g. `NEYO_SCHOOL` or `KARIBU_HIGH`). |
| `resend_api_key` | Secret | API Key from Resend.com for reliable transactional email delivery. |
| `resend_from_email` | Public | Authorized Sender Email address (e.g. `notifications@neyo.co.ke`). |

---

### 3. Identity, Single Sign-On & OAuth Vault (`OAUTH`)
Powers 1-click Google, Apple, and Microsoft logins for principals, teachers, bursars, and parents.

| Vault Parameter Key | Type | Description / Provider Guide |
| :--- | :---: | :--- |
| `oauth_google_client_id` | Public | Google Cloud Console OAuth 2.0 Client ID. |
| `oauth_google_client_secret` | Secret | Google Cloud Console OAuth 2.0 Client Secret. |
| `oauth_apple_client_id` | Public | Apple Developer Services ID for Sign in with Apple. |
| `oauth_apple_client_secret` | Secret | Apple Developer Private Key / Secret Token. |
| `oauth_microsoft_client_id` | Public | Microsoft Entra ID (Azure) Application Client ID. |
| `oauth_microsoft_client_secret` | Secret | Microsoft Entra ID Application Client Secret. |

---

### 4. AWS S3 Object Storage & Document Vaults (`AWS_S3`)
Powers high-capacity encrypted file storage for exam papers, student photos, portfolio booklets, and backups.

| Vault Parameter Key | Type | Description / Provider Guide |
| :--- | :---: | :--- |
| `aws_s3_access_key_id` | Public | AWS IAM User Access Key ID with S3 read/write permissions. |
| `aws_s3_secret_access_key` | Secret | AWS IAM User Secret Access Key. |
| `aws_s3_bucket_name` | Public | AWS S3 Bucket Name (e.g. `neyo-school-os-storage`). |
| `aws_s3_region` | Public | AWS Region code (e.g. `af-south-1` Cape Town or `us-east-1`). |

---

### 5. Government-service readiness (not vault credentials)

NEYO previously listed KRA eTIMS, NTSA and KNEC SMS values here even though no production connector consumed them. They have been removed.

- **KRA eTIMS:** taxpayer-specific OSCU/VSCU system-to-system integration requires onboarding, testing, vetting and certification. A school’s KRA PIN/communication material belongs to that school and must not be stored as one NEYO-company global value. NEYO currently keeps normal school invoices; it does not claim eTIMS submission.
- **NTSA:** NEYO stores each school vehicle’s inspection-expiry date and displays compliance reminders. No verified public “fleet inspection API key” connector exists in NEYO, so no such secret is collected.
- **KNEC:** official public result/query channels do not establish a school-owned generic placement gateway token. NEYO keeps manual KNEC/MOE records and does not claim an automated placement SMS connector.

A future connector must have official access evidence, tenant-specific consent/configuration, encrypted storage, API service, audit logs, retry/error states and live sandbox verification before its credential field appears.

---

### 6. Bundi AI, OCR & YouTube Educational Library (`GOOGLE_VISION` / `FOUNDER_AI` / `YOUTUBE`)
Powers Bundi Intelligent OCR scanning, Ask Bundi natural-language analytics, and curated YouTube strands.

| Vault Parameter Key | Type | Description / Provider Guide |
| :--- | :---: | :--- |
| `google_vision_api_key` | Secret | Google Cloud Vision API Key for Bundi OCR handwritten mark sheet & receipt scanning. |
| `founder_ai_provider_key` | Secret | Provider API Key for Ask Bundi (Founder Natural Language Q&A layer). |
| `youtube_api_key` | Secret | Google YouTube Data API v3 Key for curated classroom video library searches. |

---

## 🛠️ Step-by-Step Instructions: How to Add / Update a Credential

1. Log into NEYO with your **FOUNDER** or **SUPER_ADMIN** account.
2. Navigate to **NEYO Ops** from the top module switcher (`/founder`).
3. Click the tab titled **`Credentials & Secrets Vault`**.
4. All supported credentials are displayed immediately and grouped by provider; no search is required.
5. Click **`Edit Key`**. A pop-up dialog will open.
6. Paste your new API key or secret token in the text box.
7. Click **`Save Credential to Vault`**.
8. The system will encrypt the value using **AES-256 GCM**, stamp an entry in the audit log (`platform.integration_credential_saved`), and display a green **`CONFIGURED`** status pill!

---

## 🔐 Security & Non-Negotiable Invariants

- **Masked View Only**: Secret parameters show as `••••••••` or `•••• private key stored` in the UI to prevent screen-snooping in public spaces.
- **Audit Trails**: Every credential save or update is immutably recorded in `AuditLog` with your user ID and timestamp.
- **Instant Live Takeover**: Modules query secrets dynamically through `secretStatus()` / `readCompanySecret()`, so key updates take effect immediately without needing server restarts or code redeployments!
