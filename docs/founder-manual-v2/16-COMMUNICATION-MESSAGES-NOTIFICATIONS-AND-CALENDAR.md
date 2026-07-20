# NEYO Founder Manual V2 — Module 16: Communication, Messages, Notifications & Calendar

**Pages:** `/comms`, `/messages`, `/calendar`  
**Last verified against code:** 2026-07-18

---

## 1. Choose the correct communication tool

- Broadcast/Communication: one message to school/class/role audience with preview/cost/quota.
- Messages: ongoing direct/group/class conversation.
- Notification Bell: short event alert linking to source record.
- Calendar: dated event and optional audience invitation/feed.
- Urgent safety: Panic/security workflow, not ordinary chat.

---

## 2. Broadcast access and teacher restrictions

`/comms` requires `comms.send`.

Leadership/office holders may see school guardian, class guardian and role audiences. Teachers are
restricted to guardian audiences for classes they genuinely teach; school-wide/role targeting is
blocked or sent for approval according to current flow.

Audience resolution deduplicates guardian phone, so siblings sharing contact receive one SMS.

---

## 3. New Broadcast fields

Choose audience type/card:

- School guardians
- Class guardians → class selector
- Role → role selector

Choose channel:

- SMS
- In-app

Enter message body. UI shows characters/segments and resolved audience information.

### Check Recipients & Cost

First action runs dry preview:

- recipient count;
- SMS segments/cost KES;
- quota allowed/remaining warning;
- teacher scope/approval condition.

No send occurs. Editing message/audience invalidates old preview.

### Confirm & Send

After preview press send. Service re-resolves audience and quota, sends/creates notifications, records
BulkMessage counts/cost/sender/audience. Never rely on stale preview after roster change.

---

## 4. Teacher message approvals

When policy requires, teacher request appears in Sent/Approval area. Authorized leadership:

- **Approve & Send**
- **Reject**

Approval revalidates scope/quota. Rejection should be used for policy/safety, not to suppress normal
class communication without explanation.

---

## 5. Sent Messages

Shows audience, channel, recipient/sent/skipped counts, cost and sender/time. It is delivery attempt
ledger, not proof each person read SMS. In-app/message read evidence uses its own records.

---

## 6. Notification cascade

`notify()` can cascade in-app → push → WhatsApp → SMS → email according to configuration/preferences
and workflow. Broadcast UI directly exposes SMS/in-app; other operational features may use cascade.

Before external send: provider credentials, school prefix, phone/email, opt-out, quota and cost.
Never expose provider names/secrets in school-facing copy.

---

## 7. Messages page layout

Available to all signed-in users.

Desktop: conversation list + active thread. Mobile: list, then thread with Back.

Controls:

- New Message/Compose
- recipient search/list
- choose recipient → start/reuse direct conversation
- conversation row → open
- composer text
- attachment upload/chip/remove
- Send
- Back

Direct conversations deduplicate; class/group/announcement types follow membership and reply rules.

---

## 8. Sending Messages

Type text and/or attach allowed file. Send disabled when both empty. Service checks participant and
announcement lock, creates Message, updates conversation, notifies participants. SSE refreshes live.

Attachments use tenant storage and authorization. Do not share medical/counseling/payroll data in a
broad class group.

---

## 9. Message acknowledgements and delivery report

Urgent/ack-enabled messages may show **Acknowledge/Received** action. Sender can open delivery report:

- Recipients
- Read
- Received/acknowledged
- Unread

24-hour job can generate reports and unread urgent fallback according to policy. Read/ack is not
agreement—only receipt evidence.

---

## 10. Class Group Chat

From Teacher/Parent portal **Class Group Chat** opens one conversation per class. On open membership
syncs:

- class teacher;
- timetable subject teachers;
- linked guardian users;
- student users.

Transferred/departed members are removed at sync. Leadership oversight according to service. Parent
cannot join unrelated class.

---

## 11. Announcements

Announcement conversation is broadcast/no replies. Use Communication for targeted cost-preview
campaign; use Announcement thread for in-app notice history. Do not create ordinary group then expect
reply lock.

---

## 12. Notification Bell

Topbar bell shows unread count/live island.

Actions:

- Open bell
- Click notification → mark/read and navigate source
- Mark one read
- Mark all read
- Enable Native Notifications
- Close drawer
- Dismiss island

Native enable requests browser permission, obtains VAPID config, stores WebPushSubscription. Denied
permission cannot be overridden. Notification is not the underlying payment/approval/result.

---

## 13. User notification preferences

`NotificationPreference` opt-outs channel-by-channel through settings/API where surfaced. Essential
security/legal communications may follow separate policy. Cost preview and opt-out are rechecked at
send.

---

## 14. Calendar views and navigation

`/calendar` requires calendar.view.

Buttons:

- Previous
- Next
- Today
- Month
- Week
- Day
- iCal/feed controls
- New Event (calendar.manage)

Keyboard: Left/Right changes period; `T` Today. Legend: holiday red, exam/deadline amber, meeting blue,
sports green, event neutral.

---

## 15. New Event dialog

Fields according to current form:

- Title
- Start date
- End date for multi-day
- All-day or start/end time
- Type: event/meeting/exam/holiday/sports/deadline
- Location
- Audience: all or one Role
- Description
- Recurrence: none/weekly/monthly
- Repeat until
- Notify audience checkbox

**Save/Create Event** validates date/time order, creates CalendarEvent, optionally notifies audience.
Cancel/X/backdrop closes.

Audience filter means other roles do not see targeted event unless leadership see-all rules apply.

---

## 16. Recurring Events

Weekly repeats every 7 days. Monthly repeats same calendar day; months without that date are skipped,
not shifted. End date/hard cap limits expansion. Deleting an occurrence currently deletes series
through series id behavior—confirm before remove.

---

## 17. Event actions

Agenda/month cells show title/type/time/location/audience/description. Authorized user delete icon
removes event/series. Kenyan public/cultural holidays are read-only generated occurrences.

Calendar occurrence is scheduling notice; exam timetable/leave/admission interview source may also
hold linked data. Correct through owning workflow when linked.

---

## 18. Religious holiday preference

Tenant setting `showReligiousHolidays` controls generated religious moments. Public holidays remain.
Changing preference does not delete school-created event.

---

## 19. Calendar iCal and private feed

### iCal export

Download fixed calendar file for current window; import into external calendar. It does not live sync
unless reimported.

### Private subscription feed

Feed dialog:

- create/load private URL;
- Copy;
- Open/Subscribe;
- Rotate Link (old stops working);
- revoke where surfaced.

Treat token as password: anyone with URL may read authorized feed. Rotate after exposure; never post
publicly.

---

## 20. Full examples

### Parent meeting broadcast

1. Create Calendar meeting targeted Parent, date/time/location, Notify on.
2. Communication → Class Guardians.
3. Draft specific SMS.
4. Check recipients/cost/quota.
5. Confirm Send.
6. Sent ledger records attempt; Calendar remains date source.

### Urgent teacher instruction

1. Direct message/group appropriate staff, mark urgency per workflow.
2. Request acknowledgment.
3. Check delivery report.
4. Unread fallback job sends approved channel after threshold.
5. For immediate safety emergency use Panic, not chat.

---

## 21. Common errors

| Problem | Check |
|---|---|
| Broadcast forbidden | comms.send |
| Teacher cannot school-wide | expected own-class restriction/approval |
| Recipient count low | guardian phone/user role/class links/dedupe |
| SMS blocked | quota/provider/phone/segment cost |
| In-app sent but no SMS | selected channel/cascade/provider |
| Message conversation missing | membership/recipient/tenant |
| Cannot reply | Announcement or locked thread |
| Attachment fails | type/size/storage |
| Push unavailable | browser permission/VAPID/service worker/HTTPS |
| Event invisible to role | audience filter |
| Monthly occurrence missing | month lacks chosen day |
| Feed exposed | rotate immediately |

---

## 22. Founder verification checklist

1. Leadership school/class/role audiences and phone dedupe.
2. Teacher own-class only and approval flow.
3. Dry cost/quota then send revalidation.
4. Sent counts/cost/audit.
5. Direct dedupe, group membership, announcement lock.
6. Text/file send and tenant serve guard.
7. SSE/read/ack/delivery report/fallback.
8. Class Chat sync and transfer removal.
9. Bell unread/mark one/all/navigation.
10. Native push allow/deny/config.
11. Calendar month/week/day/keyboard.
12. Event validation/audience/invite/delete.
13. Weekly/monthly recurrence edge cases.
14. Holidays/religious preference.
15. iCal and private feed rotate/revoke.
16. Cross-tenant and denied roles.
17. Mobile/glass/loading/empty/error states.

---

## 23. Gap review

Broadcast, Messages, Notifications and Calendar actions are connected to real services/routes. No
orphaned component was found in this pass. External WhatsApp/SMS/email/push delivery remains
credential-dependent and must not be described as live without provider evidence.

---

## 24. Edit points

- Broadcast: `comms-client.tsx`, `comms.service.ts`, `/api/comms`
- Messages: `messages-client.tsx`, `messaging.service.ts`, conversations APIs
- Notifications: `notification-bell.tsx`, `notification.service.ts`, notification APIs/providers
- Class Chat: `class-chat.service.ts`, ClassChatButton
- Calendar: `calendar-view.tsx`, `calendar.service.ts`, calendar APIs
- Jobs: message fallback/delivery report registry

## Mobile message visibility and composer behaviour

The conversation card now separates three fixed regions: a non-scrolling header, an independently scrolling message history, and a composer that remains visible at the bottom. Sending a message scrolls only the message-history viewport; it no longer calls a whole-page scroll that could move the card beneath the mobile shell. The panel follows the phone's visible viewport when the on-screen keyboard opens, respects the bottom safe area, and allows the optional acknowledgement/SMS controls to scroll inside the composer if vertical space is very small. Long words, links and attachment text wrap inside the bubble rather than being clipped by the card.

Founder verification at 360px: open a thread with enough messages to overflow; send short text, multi-line text and one unbroken long URL; confirm the newest bubble and send box remain reachable; open the keyboard and rotate the device; then test incoming and outgoing bubbles, acknowledgement controls and an attachment.

## Notification visibility

The Dynamic Island alert and notification inbox now use fully opaque white surfaces with strong navy borders/text in light mode and fully opaque navy surfaces in dark mode. Backdrop blur and highly transparent white layers were removed from these two surfaces so page content cannot show through and reduce readability.
