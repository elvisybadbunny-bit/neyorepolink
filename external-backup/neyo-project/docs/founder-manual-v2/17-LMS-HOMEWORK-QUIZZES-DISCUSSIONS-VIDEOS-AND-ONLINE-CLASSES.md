# NEYO Founder Manual V2 — Module 17: LMS, Videos & Online Classes

**Pages:** `/lms`, `/learning-videos`, `/online-classes`, `/online-classes/join/[roomId]`  
**Last verified against code:** 2026-07-18

---

## 1. LMS roles

Staff `/lms` requires academics view plus homework assignment; families use Portal. Teacher class
scope applies. LMS tabs:

1. Quizzes
2. Hand-ins
3. Discussions

Homework/notes originate Teacher Portal; submissions/grades and quizzes/discussions operate here.

---

## 2. Quizzes

**New Quiz** fields include Class, Subject, Title, Due date and questions.

Each question:

- prompt;
- 2+ options;
- click circle to mark correct option;
- + Add option;
- remove option;
- remove question.

**Add Question** appends. **Save Quiz** creates Draft. Quiz list Publish/Hide toggles student
visibility. Click title/results opens learner attempts, score, completion and class average.

Correct index never goes to student before attempt. One attempt and due-date rules apply.

---

## 3. Teacher Quiz Results

Open quiz card/title. Shows each eligible student Attempted/Not attempted, score/total/percentage.
Back returns. Results are server-marked; editing questions after attempts should be governed carefully
because historical interpretation may change.

---

## 4. Hand-ins

Choose Homework. Sheet shows class roster states:

- Missing
- Handed in
- Late
- Graded

Open learner submission; review typed answer/file. **Grade** or **Re-grade** opens percentage and
feedback. Save locks re-submission according to service. Feedback appears Portal.

Do not download learner files to shared device without secure cleanup.

---

## 5. Discussions

Choose Class; threads list title/author/replies/locked.

- **New Thread**: title + body → Post.
- Open thread → posts/replies.
- Add Reply.
- Teacher Lock/Unlock; locked rejects new posts.

Families only access child's class. Role chips identify Teacher/Student/Parent. Apply moderation and
safeguarding; remove/escalate harmful content through authorized process.

---

## 6. Family LMS

Portal provides:

- Hand In/Re-submit homework;
- Quiz list/Take Quiz;
- option selection/Submit;
- instant server result and per-question review;
- Class Discussion/New Thread/Reply;
- teacher feedback.

Another family's paper/submission/thread is blocked.

---

## 7. Learning Videos

Search query → **Search**. Suggested idea buttons populate searches. Without YouTube key/quota,
paste URL/ID → **Save Link** and use approved saved repository.

Result buttons:

- Watch: embedded player in NEYO.
- Save: school library.
- Cast: records shown-in-class session and opens class display workflow.

**Videos shown in class** opens history; select to replay. National videos require Ops vetting;
school videos stay tenant private.

---

## 8. Online Classes board

Board lists only classes/sessions the user is entitled to:

- teacher: classes genuinely taught;
- leadership: school oversight;
- parent/student: linked/own class sessions only.

This security gap was fixed in this chapter. Previously GET returned every school class/session to
any signed-in tenant user and UI displayed Request/Start/End even when backend rejected actions.

### Request Live Class — teacher/leadership only

Fields:

- Class (scoped)
- Title
- Scheduled time

**Request Class + Notify** creates OnlineClassSession, room/join URL/TV code and notifies class family/
student users via in-app/push.

### Session card

Shows title, class, teacher, scheduled time, status, TV code and **Join mobile/TV**.

- **Start**: only requesting teacher or leadership; status Running and notifies class.
- **End**: same control; status Ended.
- Other linked viewers see Join/status, not request/start/end controls.

---

## 9. Live room join

Open Join URL.

Before joined:

- **Join mobile**
- **Join TV** (display role; no mic/video controls)

After joined:

- Mic on/off
- Camera on/off
- Teacher Share Screen
- Full Screen
- Picture-in-Picture Pop Out/Back
- Connect All
- Leave

Browser requests camera/microphone/screen permission. HTTPS and peer connectivity required.

---

## 10. Teacher room controls

Teacher buttons:

- Mute all students
- Disable student video
- Share screen
- approve raised question **Let speak**
- **Dismiss** question

Student control buttons become disabled when teacher policy active. Controls are signaled to room;
they do not override browser/OS privacy permissions.

---

## 11. Peers and questions

Participants list shows display name/role and **connect**. **Connect All** initiates peer connections.
Student enters question and presses **Ask Teacher**. Teacher approves/dismisses.

WebRTC signaling types include join/leave/offer/answer/ICE/control/screen-share. Polling is scoped to
room/tenant/participant.

---

## 12. Online class limitations

Current implementation is peer-to-peer WebRTC signaling, not a hosted SFU recording platform.
Large classes/NAT/firewall may need TURN/SFU infrastructure. Recording is controlled/consent-bound;
do not claim recording or guaranteed scale without deployed infrastructure and safeguarding policy.

TV access code is sensitive room convenience, not permanent password. End sessions after class.

---

## 13. Full learning example

1. Teacher assigns homework/notes in Teacher Portal.
2. Creates Draft quiz, tests correct answers, publishes.
3. Opens Discussion revision thread.
4. Requests online revision class; linked families notified.
5. Starts room, shares screen/video, moderates questions, ends.
6. Students submit quiz/homework.
7. Teacher opens Hand-ins, grades/feedback.
8. Reviews quiz results and class discussion.
9. Saves/casts approved learning video; shown history available.

---

## 14. Common errors

| Problem | Check |
|---|---|
| LMS redirects Portal | no homework.assign; family expected |
| Quiz invisible | Draft/unpublished/wrong class/due |
| Second attempt blocked | one-attempt rule |
| Correct answer leaked | product defect—paper must strip correctIndex |
| Submission cannot re-submit | already graded/closed |
| Forum post blocked | locked/wrong class |
| YouTube search unavailable | key/quota; paste/saved fallback |
| Online Request hidden | expected for parent/student; fixed role UI |
| Wrong classes visible | fixed board row scope; verify assignment/link |
| Start/End hidden | not requesting teacher/leadership |
| Camera/mic fails | permission/HTTPS/device/browser |
| Peers fail | network/NAT/TURN limitations |

---

## 15. Founder verification checklist

1. Teacher own classes only; family child class only.
2. Quiz builder validation/publish/hide.
3. Student paper excludes correct index.
4. Submit exact score/one-attempt/due.
5. Hand-in late/re-submit/grade lock/feedback.
6. Discussion create/reply/lock and cross-class block.
7. Videos search fallback/save/watch/cast/history.
8. Online board class/session scope (fixed).
9. Parent/student no request/start/end controls (fixed).
10. Request notification/join URL/TV code.
11. Requesting teacher/leadership Start/End only.
12. Room mobile/TV/mic/video/share/fullscreen/PiP/leave.
13. Mute/video controls and question moderation.
14. Cross-tenant room/signal blocked.
15. Mobile/glass/loading/empty/error states.

---

## 16. Gap fixed

`onlineClassBoard()` previously returned every non-archived class and 50 sessions to any signed-in
user in the tenant. Backend protected mutations, but UI exposed request/start/end controls and class
metadata before rejection. Fixed service board scope using teacher assignments or parent/student
`scopeWhere()`, returned `canManage` and per-session `canControl`, and hid Request/Start/End controls
accordingly. This is real service + UI security repair; no schema change required.

---

## 17. Edit points

- LMS: `lms-client.tsx`, `lms.service.ts`, `/api/lms/*`
- Family LMS: `portal/lms-cards.tsx`, `/api/portal/lms`
- Videos: `learning-videos-client.tsx`, `youtube-learning.service.ts`
- Online board/room: `online-classes-client.tsx`, `online-class-room-client.tsx`,
  `online-class.service.ts`, online APIs
