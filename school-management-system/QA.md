# School ERP — End-to-end QA matrix (Phases 17–18)

## Auth & security
- [ ] Login with seed users (`Dev@School123!`)
- [ ] Refresh token renews session after access expiry
- [ ] RoleGate blocks accountant from `/app/attendance` URL
- [ ] Response headers include `X-Content-Type-Options: nosniff`
- [ ] Public enquiry POST works without JWT; other `/api/**` require auth

## Core academics
- [ ] Academic years / classes / sections / subjects CRUD
- [ ] Student create, edit, deactivate / reactivate
- [ ] Guardian create from Guardians page
- [ ] Attendance mark + report + staff attendance
- [ ] Timetable + homework + exams publish + marks

## Finance
- [ ] Fee structures, generate invoice, create payment order
- [ ] Offline confirm → receipt appears on Receipts
- [ ] Pending fees campus list + CSV export on Reports

## Campus ops (V6)
- [ ] Create entrance test / interview / promotion / TC records
- [ ] Health, discipline, sports, labs, PTM, alumni records
- [ ] Inventory add + issue 1
- [ ] Payroll draft for a staff member
- [ ] Study paper catalogue entry
- [ ] Bus trip ping location → coordinates show on Bus tracking

## Admissions
- [ ] Enquiry → application → enroll creates student
- [ ] Student documents upload via files API

## Portal roles
- [ ] Parent: children switcher, fees, receipts, notices
- [ ] Student: homework, timetable, published exams
- [ ] Teacher: attendance, marks, campus records create
- [ ] Super admin: branches + all modules

## Responsive
- [ ] Sidebar drawer on mobile; tables scroll horizontally
- [ ] Public site hero fits phone viewport without overflow

## Build gates
- [x] Backend tests (`mvn test`)
- [x] Frontend typecheck (`tsc --noEmit`)
- [x] Phase0 vitest registry assertions
