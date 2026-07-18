# NEYO Founder Manual V2 — Module 20: Transport & Fleet

**Page:** `/transport`  
**Last verified against code:** 2026-07-18

---

## 1. Records and tabs

Route → optional Shifts → Vehicle/Driver → Student Assignment/Pickup Stop → term invoice. Vehicle has
fuel and maintenance logs; Parent can request route/shift change.

Tabs:

1. Routes
2. Fleet
3. Drivers
4. Requests

Requires transport.view; changes transport.manage.

---

## 2. Transport Settings

Press Settings. Configure:

- Parent route-change requests allowed on/off.
- Mid-term billing rule:
  - Pro-rate remaining term
  - Full top-up invoice now
  - Next-term only

Save. Rule is used in request approval preview/action; it does not retroactively change old invoices.

---

## 3. New Route

Fields:

- Route name
- Ordered stops (school validates chosen pickup stop)
- Term fee KES
- Vehicle optional
- Driver optional

**Save/Create Route**. Duplicate name blocked. Route card shows stops, vehicle/driver, riders and
seats left.

Buttons:

- Riders
- Shifts
- Invoice Riders

---

## 4. Riders

Open route → **Add Rider**. Select Student, pickup stop and Shift where route has shifts. Optional
Auto Allocate lets service choose available shift/seat.

Rules:

- one active route assignment per student;
- pickup stop must exist on route;
- effective bus/shift capacity;
- shift required when configured unless auto allocate;
- cross-tenant student blocked.

Release icon removes assignment; double release blocked.

---

## 5. Invoice Riders

Press **Invoice Riders**, choose year/term/due. Creates ordinary Finance invoice using route/shift
fee, idempotently skips already billed same term. Parent pays Portal/M-Pesa. Releasing/changing route
requires billing-rule review; invoices do not disappear automatically.

---

## 6. Route Shifts

Use when route runs multiple trips/buses.

**New Shift** fields:

- Shift name
- Start/end time
- Vehicle
- Driver
- Seat-cap override optional
- Term-fee override optional

Save. Existing shift **Edit** or **Archive**. Effective capacity uses override or vehicle capacity.
Archive prevents new assignment while preserving history.

---

## 7. Fleet tab

**Add Vehicle** fields:

- Registration number
- Make/model
- Seat capacity
- Insurance expiry
- NTSA inspection expiry

Cards show routes, capacity, compliance alerts, last service and km/L when fuel data supports.
Click vehicle opens file. Duplicate registration blocked.

This core Fleet tab is the transport source for buses, fuel and maintenance. Reception also contains
an extension Fleet Log/Safety suite for pre-trip/receipt/NTSA operations; use one agreed operational
source and avoid duplicate vehicle creation where extension records are separate.

---

## 8. Vehicle File

Tiles:

- Fuel total KES/litres
- Maintenance total/entries
- Seats

Buttons:

- **Log Fuel**
- **Log Maintenance**
- Back

Fuel table shows date/litres/cost/odometer/station and computed km/L between readings. Maintenance
shows service/repair/type/date/cost/odometer/garage/description.

---

## 9. Log Fuel

Fields include date, litres, cost, odometer and station. **Save** requires litres/cost. Odometer must
be truthful/increasing for meaningful efficiency; incorrect order produces misleading km/L.

Fuel expense here is operational fleet log, not automatically accounting payment unless integrated.

---

## 10. Log Maintenance

Fields include type, date, description required, cost, odometer, garage. **Save** adds immutable
history entry. Do not delete repairs to reduce displayed cost; correct through authorized process.

---

## 11. Drivers tab

**Add Driver** fields:

- Full name
- Kenyan phone
- Driving licence number
- Licence expiry
- National ID optional

Save normalizes phone and blocks duplicate licence. Cards show assigned routes and expiry alerts.
Adding driver does not create Staff User/payroll automatically.

---

## 12. Parent Change Requests

Requests tab lists pending/decided requests with learner, current/requested route/shift/stop, reason,
requester, billing preview.

Buttons:

- Approve: validates capacity/stops, changes assignment and applies configured billing action.
- Decline: opens reason, confirm decline.

Parent request alone changes nothing. Approval must not overbook shift.

---

## 13. GPS bus tracking

Schema/service foundation and UI seam may exist, but real live tracking requires fitted hardware/
location feed. Do not claim current bus position without real tracker data. Staff GPS clock-in is a
different feature.

---

## 14. Full example

1. Add KCB 123A, 33 seats, compliance dates.
2. Add Wafula driver/licence.
3. Create Mwiki route with ordered stops, KES 9,000/term.
4. Add Morning A/B shifts with vehicle/seat caps.
5. Add Achieng, choose Seasons; capacity checked.
6. Invoice Riders Term 2; Portal invoice appears.
7. Log fuel and service; review km/L/expiry.
8. Parent requests different shift; approve with billing rule/capacity.
9. Archive old shift after riders moved.

---

## 15. Common errors

| Problem | Check |
|---|---|
| Route button missing | transport.manage |
| Student pickup rejected | stop not on route |
| Route/shift full | effective capacity; use valid alternative |
| Invoice creates 0 | already billed/no riders |
| km/L wrong | odometer sequence/litres |
| Insurance alert | update only with real renewed evidence |
| Driver not Staff | Driver and User/HR are separate |
| Parent request not applied | pending/declined/capacity/settings |
| GPS unavailable | hardware/feed not active |
| Duplicate fleet records | core Transport vs Reception extension coordination |

---

## 16. Founder verification checklist

1. Settings request/billing rules.
2. Route/stops/fee/vehicle/driver.
3. Shift create/edit/archive/cap override.
4. Assignment one-route/stop/capacity/auto allocation.
5. Release/double release.
6. Rider invoice idempotency/Portal.
7. Vehicle duplicate/compliance alerts.
8. Fuel totals/kmL.
9. Maintenance totals/history.
10. Driver phone/licence duplicate/expiry.
11. Parent request approve/decline/billing/capacity.
12. Cross-tenant and denied roles.
13. Hardware GPS honesty.
14. Mobile/glass/loading/empty/error states.

---

## 17. Gap review

Core Routes/Fleet/Drivers/Requests, rider, shifts, fuel, maintenance and invoices are wired. No
orphaned Transport control found. Reception Fleet extension is separately wired; operational policy
should prevent duplicate vehicle records but this is a product consolidation decision, not missing
code.

---

## 18. Edit points

- `transport-client.tsx`, `transport.service.ts`, `/api/transport`
- Parent card/routes
- Finance invoices
- Reception `fleet-suite.tsx` extension
- GPS hardware integration
