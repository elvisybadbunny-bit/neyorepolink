# Level 6 — Customer Documentation: Help Center, Role Guides & FAQs
**Document Id**: `NEYO-BIB-L6`  
**Owner**: NEYO Customer Support & Onboarding Operations (`NEYO_SUPPORT`)  
**Status**: Living Customer Knowledge Base  
**Last Updated**: 2026-07-17  

---

## 1. Help Center Architecture & Philosophy

The NEYO Help Center (`/help`) is accessible directly from the top navigation bar or via keyboard shortcut (`⌘/` or `Ctrl+/`). Every guide is written in crisp, jargon-free English and Swahili, structured around exact school job roles rather than technical software modules.

---

## 2. Principal & Director Guide (`PRINCIPAL` / `SCHOOL_OWNER`)

### 2.1 How to Conduct a Syllabus Coverage Audit (`I.97`)
As a school leader, ensuring teachers cover the actual curriculum before grading is vital:
1. Open **Academics -> Syllabus Audit (`I.97`) tab**.
2. Select the target **Class (`e.g. Grade 8 East`)** and **Subject (`e.g. Mathematics`)**.
3. NEYO displays a color-coded verification grid:
   - **Green (`VERIFIED_COVERED`)**: The teacher marked this topic delivered AND at least 1 real student assessment (`CbcAssessment` / `LessonObservation`) has been logged against it.
   - **Yellow (`SELF_REPORTED_ONLY`)**: The teacher checked off the topic, but **0 student assessments** exist in the system. NEYO alerts you to verify classroom work.
   - **Red (`NOT_COVERED`)**: No updates or assessments exist. NEYO assumes the topic was never taught.
4. **Export Audit**: Click **[ Print Audit Report (`⌘P`) ]** to generate a clean, high-contrast summary for your academic board.

### 2.2 How to Transfer Classes Without Losing Academic Records (`B.12 Continuity`)
When a teacher leaves mid-term or classes are rearranged:
1. Open **Academics -> Teacher Allocation (`AA.3`)**.
2. Select the departing teacher (`e.g. Wanjiru`) and click **[ Review & Reallocate ]**.
3. Assign their subjects (`e.g. Grade 9 Mathematics`) to the replacement teacher (`e.g. Omondi`).
4. Click **[ Confirm Transfer ]**.
5. **Instant Transfer Continuity**: The moment Teacher Omondi logs in, all student lists, historical mark sheets, and attendance registers appear instantly inside his **My Classes** tab. No data is lost, and ordinary teachers cannot delete past records (`cant be deleted anyhowly`).

### 2.3 How to Publish the Teacher Duty Roster with In-App Notifications (`i78`)
1. Open **HR -> Duty Roster (`i78`)**.
2. Assign teachers to weekly duties (`e.g. Teacher on Duty, Cafeteria Supervision, Gate Check`).
3. Click **[ 🚀 Publish Duty Roster ]**.
4. NEYO immediately emits a real-time notification (`db.notification.create`) directly to every assigned teacher's mobile device and top-bar notification island (`I.34`).

---

## 3. Teacher & Class Teacher Guide (`TEACHER` / `CLASS_TEACHER`)

### 3.1 How to 1-Click Apply Universal CBC/CBE Presets (`EE.15`)
Stop manually typing out curriculum competencies and rubrics!
1. Inside your class dashboard (`Academics -> CBC Strands`), click the **[ ⚡ Universal Presets (`EE.15`) ]** button.
2. A Liquid Glass modal (`UniversalPresetsModal`) opens showing the standard KICD package.
3. Click **[ Apply Universal Presets Now ]**.
4. NEYO instantly sets up all **7 Universal Core Competencies (`J.6`)**, official **4-Point Formative Rubrics (`EE, ME, AE, BE`)** (or **8-Point Senior CBE Rubrics (`1 to 8 Points`)** `EE.15 / J.5` for Grade 10–12), and student leadership duties. If you click it twice, NEYO skips duplicates safely (`0 duplicates created on re-run`).

### 3.2 How to Auto-Fill Student Report Comments (`EE.2` Rubric-Driven Comments)
1. Navigate to **Exams -> Enter Marks -> Comment Bank (`EE.2`)**.
2. Select your class. Instead of typing *"He is a good boy"* 50 times, click **[ Auto-Fill by Rubric Level ]**.
3. **Bundi drafts...** authentic comments directly from your school's custom comment repository (`CbcCommentBankEntry`) based on the learner's exact grade distribution (`never using generic AI text`).
4. Review, customize if desired, and click **[ Save All Comments ]**.

### 3.3 How to Use the Interactive STEM Virtual Lab Projector (`EE.13`)
Make science and math come alive on your classroom projector or tablet!
1. Open **Academics -> Question Bank (`EE.8`) -> Tab 5: STEM Virtual Labs (`EE.13`)**.
2. Select an interactive simulation station:
   - **Ohm's Law (`I = V/R`)**: Drag the Voltage (`V`) slider up and watch the glowing bulb schematic increase in brightness while the exact Amperage (`A`) updates live.
   - **Levers & Moments Balance**: Adjust weights (`Kg`) and fulcrum distances (`m`) to balance the virtual see-saw and teach the Principle of Moments (`F₁ × d₁ = F₂ × d₂`).
   - **Pythagoras Right Triangle (`c = √(a² + b²)`)**: Drag triangle base/height handles to calculate hypotenuse lengths instantly.

### 3.4 How to Scan Paper Quizzes to Formative Assessment (`EE.9`)
1. Give your students a paper multiple-choice or short-answer quiz.
2. Open **Academics -> Paper Quiz Converter (`EE.9`)**.
3. Take a photo of the graded student answer sheet using your smartphone camera.
4. NEYO's local OCR pipeline (`runPaperQuizScanAndConvert`) reads the marks and automatically converts them into official KICD 4-point CBC rubrics (`EE / ME / AE / BE`) linked to your sub-strand!

---

## 4. Bursar & Finance Guide (`BURSAR` / `ACCOUNTANT`)

### 4.1 How to Create High-Contrast Installment Plans (`InstallmentPlanDialog` `z-[100]`)
When a parent requests to pay school fees across multiple dates:
1. Open **Finance -> Fee Ledgers (`B.7`) -> Installment Plans (`I.99`)**.
2. Click **[ + Create Installment Plan ]**. A high-contrast, opaque card modal opens (`z-[100] bg-white dark:bg-slate-900 shadow-2xl`) that never blurs out or disappears.
3. Select the parent and total balance (`e.g. KES 45,000`).
4. Add payment milestone dates (`e.g. KES 15,000 on 1st Aug, KES 15,000 on 1st Sep, KES 15,000 on 1st Oct`).
5. Click **[ Save Promise-to-Pay ]**. The dates automatically populate on your **Fee Promise Calendar (`I.24`)**, and NEYO will send automated 1-tap SMS reminders when dates approach.

### 4.2 How to Verify M-Pesa STK Push Payments (`I.41 / R.3`)
1. When parents pay via their mobile phones (`Mzazi Direct Pay`), transactions appear instantly inside **Finance -> Live Fee Ledger**.
2. The **Biometric Finance Gate (`R.3`)** automatically verifies Safaricom Daraja signatures and updates the student's exact balance.
3. If a parent pays cash or bank deposit, click **[ Enter Payment (`R.5`) ]**, enter the bank slip number, and save. NEYO blocks duplicate bank receipt numbers automatically (`0 double-counting`).

---

## 5. Librarian Guide (`LIBRARIAN`)

### 5.1 How to Check Out Books in 1 Tap (`IssueTab` / `library-client.tsx`)
1. Open **Library -> Circulation Station -> Issue Tab (`scan`)**.
2. Point your smartphone camera or USB handheld scanner at the book's barcode (`BK-0001`).
3. Point the scanner at the student's ID card QR code.
4. **Auto-Fill Magic**: NEYO fills in the Book Title, Author, and Shelf Location instantly. It also **auto-calculates the Due Date (`dueDate`)** (`Today + loanPeriodDays` — default 14 days).
5. Press **[ Issue Book Now ]**. Circulation recorded in under 1 second!

---

## 6. Security Guard & Front Desk Guide (`SUPPORT_STAFF` / `RECEPTIONIST`)

### 6.1 How to Operate the Sub-Second QR Gate Checkpoint (`EE.11`)
1. Open **Security -> QR Checkpoint (`EE.11`)** on your gate tablet or smartphone (`gate-client.tsx`).
2. When a student approaches the gate with their ID card or printed Gate Pass (`GP-0001`), hold up the camera.
3. Within **150 milliseconds** (`<0.15 seconds`), the screen flashes a high-contrast status card:
   - 🟢 **ALLOWED / ACTIVE GATE PASS**: Pass is approved by principal. Button appears: **[ Stamp Gate Exited Now ]**. Tap once to stamp departure time (`usedAt`).
   - 🟡 **DIDNT_PASS / ALREADY EXITED CAMPUS**: Student already left campus earlier today. When they return from their trip, tap **[ Stamp Gate Returned Now ]** to record check-in return time (`returnedAt DateTime?`).
   - 🔴 **NOT_ALLOWED / PASS PENDING**: Pass exists but has not been signed off by principal/HOD. Student cannot exit!
   - 🔴 **INVALID / NOT FOUND**: QR code is forged or unrecognized.

---

## 7. Parent Guide (`PARENT`)

### 7.1 How to Check Your Child's Grade 10 Senior School Pathway via SMS (`EE.12` `22263 style`)
1. Open your mobile phone SMS message app.
2. Type your child's **KNEC Assessment Number** (`e.g. KJSEA-2025-0012345`).
3. Send to NEYO's official shortcode (`or school SMS portal`).
4. Within seconds, you receive an exact reply: *"Student Kamau is placed in Grade 10 STEM Pathway, Class 10 East. KJSEA Milestone Score: 82% (L4 EE)."* (`Note: KES 30 lookup fee applies`).

### 7.2 How to Download Your Child's A4 PDF Digital Portfolio (`EE.14`)
1. Log into your **Parent Portal (`B.10`)**.
2. Navigate to **My Children -> Digital Portfolio (`EE.14`)**.
3. Click **[ Download A4 PDF Album ]**.
4. NEYO generates a beautifully styled A4 document containing your child's project photos, 7 Universal Competency star ratings (`★`), and teacher comments ready for printing (`export=pdf not json`).

---

## 8. Troubleshooting Guide & Frequently Asked Questions (FAQs)

| Question / Symptom | Likely Cause | Exact Solution |
| :--- | :--- | :--- |
| **"I can't find the Universal Presets (`EE.15`) or QR Gate (`EE.11`) button in my school menu!"** | The feature is switched OFF in NEYO Ops platform switches (`platform-flags.service.ts`). | Contact `founder@neyo.co.ke` or `NEYO_OPS` to toggle the release switch for your school tenant (`assertEeFeatureReleased`). |
| **"When uploading an exam paper, it says 'Something went wrong, try again later'."** | File format restriction or file size exceeding 10MB limit. | Fixed in our production build (`entrance-exam.ts`). Ensure your file is a standard PDF, JPG, or PNG under 10MB. |
| **"My school internet went down. Can I still mark attendance or scan gate passes?"** | Rural connectivity interruption (`Z.1 Offline Resilience`). | Yes! NEYO's offline Service Worker caches your active rosters locally. Mark attendance or stamp gate passes normally; NEYO syncs to cloud automatically once internet restores. |
| **"How do I search for a student without scrolling through a 500-person dropdown?"** | Use the case-insensitive type-to-search picker (`StudentSearchSelect`). | Simply type any part of the student's name in lowercase or uppercase (`e.g. 'kamau'` or `'KAMAU'`). NEYO finds them instantly (`mode: "insensitive"`). |
