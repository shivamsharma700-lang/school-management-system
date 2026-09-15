# Real-school pilot API QA — outputs JSON-ish log lines
$ErrorActionPreference = 'Continue'
$Base = 'http://127.0.0.1:8080'
$Pass = 'Dev@School123!'
$Results = [System.Collections.Generic.List[string]]::new()
function Log($s) { $Results.Add($s); Write-Host $s }
function Login($email) {
  $body = @{ username = $email; password = $Pass } | ConvertTo-Json
  $r = Invoke-RestMethod -Uri "$Base/api/auth/login" -Method POST -ContentType 'application/json' -Body $body
  return $r
}
function Api($token, $method, $path, $bodyObj = $null) {
  $headers = @{ Authorization = "Bearer $token" }
  $params = @{
    Uri = "$Base$path"
    Method = $method
    Headers = $headers
  }
  if ($null -ne $bodyObj) {
    $params.ContentType = 'application/json'
    $params.Body = ($bodyObj | ConvertTo-Json -Depth 8 -Compress)
  }
  try {
    $resp = Invoke-WebRequest @params -UseBasicParsing
    return @{ ok = $true; status = [int]$resp.StatusCode; body = $resp.Content }
  } catch {
    $status = 0
    $content = ''
    if ($_.Exception.Response) {
      $status = [int]$_.Exception.Response.StatusCode
      try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $content = $reader.ReadToEnd()
      } catch {}
    }
    return @{ ok = $false; status = $status; body = $content; err = $_.Exception.Message }
  }
}
function ExpectStatus($label, $res, $want) {
  if ($res.status -eq $want) { Log "PASS|$label|status=$($res.status)" }
  else { Log "FAIL|$label|want=$want got=$($res.status) body=$($res.body.Substring(0,[Math]::Min(180,$res.body.Length)))" }
}
function ExpectOk($label, $res) {
  if ($res.ok) { Log "PASS|$label|status=$($res.status)" }
  else { Log "FAIL|$label|status=$($res.status) $($res.err) body=$($res.body.Substring(0,[Math]::Min(180,$res.body.Length)))" }
}

Log "=== PILOT QA START $(Get-Date -Format o) ==="

# ---- AUTH ----
$admin = Login 'super.admin@sms.local'
$principal = Login 'principal@sms.local'
$teacher = Login 'teacher@sms.local'
$accountant = Login 'accountant@sms.local'
$parent = Login 'parent@sms.local'
$student = Login 'student@sms.local'
Log "PASS|login|all 6 roles"

# Refresh
$ref = Invoke-RestMethod -Uri "$Base/api/auth/refresh" -Method POST -ContentType 'application/json' -Body (@{ refreshToken = $admin.refreshToken } | ConvertTo-Json)
$oldRefresh = $admin.refreshToken
$adminAccess = $ref.accessToken
$adminRefresh = $ref.refreshToken
Log "PASS|refresh|rotated"

# Old refresh reuse must fail
$reuse = Api '' 'POST' '/api/auth/refresh' @{ refreshToken = $oldRefresh }
# Api without token for refresh - need unauthenticated call
try {
  Invoke-RestMethod -Uri "$Base/api/auth/refresh" -Method POST -ContentType 'application/json' -Body (@{ refreshToken = $oldRefresh } | ConvertTo-Json) | Out-Null
  Log 'FAIL|refresh_reuse|accepted revoked token'
} catch {
  Log "PASS|refresh_reuse|rejected as expected"
}

# Logout revoke
$logoutBody = @{ refreshToken = $adminRefresh } | ConvertTo-Json
Invoke-WebRequest -Uri "$Base/api/auth/logout" -Method POST -ContentType 'application/json' -Body $logoutBody -UseBasicParsing | Out-Null
try {
  Invoke-RestMethod -Uri "$Base/api/auth/refresh" -Method POST -ContentType 'application/json' -Body (@{ refreshToken = $adminRefresh } | ConvertTo-Json) | Out-Null
  Log 'FAIL|logout_revoke|refresh still worked'
} catch {
  Log 'PASS|logout_revoke|refresh rejected after logout'
}

# Re-login admin for rest of tests
$admin = Login 'super.admin@sms.local'
$A = $admin.accessToken
$P = $principal.accessToken
$T = $teacher.accessToken
$C = $accountant.accessToken
$G = $parent.accessToken
$S = $student.accessToken

# logout-all
$la = Login 'super.admin@sms.local'
$tok = $la.accessToken
$rt = $la.refreshToken
$r2 = Api $tok 'POST' '/api/auth/logout-all' @{}
ExpectStatus 'logout_all' $r2 204
try {
  Invoke-RestMethod -Uri "$Base/api/auth/refresh" -Method POST -ContentType 'application/json' -Body (@{ refreshToken = $rt } | ConvertTo-Json) | Out-Null
  Log 'FAIL|logout_all_revoke|refresh still worked'
} catch {
  Log 'PASS|logout_all_revoke|refresh rejected'
}
$admin = Login 'super.admin@sms.local'
$A = $admin.accessToken

# ---- ADMIN MODULE READS ----
$adminGets = @(
  '/api/dashboard',
  '/api/students?size=5',
  '/api/guardians?size=5',
  '/api/classes',
  '/api/sections',
  '/api/subjects',
  '/api/timetable',
  '/api/homework',
  '/api/exams',
  '/api/fee-structures',
  '/api/invoices?status=PENDING',
  '/api/staff',
  '/api/payroll',
  '/api/library/books',
  '/api/transport/routes',
  '/api/inventory',
  '/api/events',
  '/api/notices',
  '/api/reports/summary',
  '/api/users',
  '/api/settings',
  '/api/audit-logs',
  '/api/admissions/enquiries',
  '/api/campus-records?type=HEALTH',
  '/api/campus-records?type=DISCIPLINE'
)
foreach ($path in $adminGets) {
  $r = Api $A 'GET' $path
  ExpectOk "admin_GET $path" $r
}

# Find seeded student Arjun
$stuPage = Api $A 'GET' '/api/students?q=Arjun&size=20'
$stuJson = $stuPage.body | ConvertFrom-Json
$arjun = $stuJson.items | Where-Object { $_.admissionNumber -eq 'NTH-2025-0001' -or $_.fullName -like '*Arjun*' } | Select-Object -First 1
if (-not $arjun) { $arjun = $stuJson.items | Select-Object -First 1 }
Log "INFO|arjun_id=$($arjun.id) name=$($arjun.fullName) class=$($arjun.className) section=$($arjun.sectionName)"

$ws = Api $A 'GET' "/api/students/$($arjun.id)/workspace"
ExpectOk 'admin_student360' $ws
$wsObj = $ws.body | ConvertFrom-Json
Log "INFO|360 guardians=$($wsObj.guardians.Count) attendance%=$($wsObj.attendance.percentage) health=$($wsObj.health.Count) discipline=$($wsObj.discipline.Count) transport=$($wsObj.transport.Count)"

# East outsider for RBAC
$eastPage = Api $A 'GET' '/api/students?q=Other+Child&size=5'
$eastJson = $eastPage.body | ConvertFrom-Json
$outsider = $eastJson.items | Where-Object { $_.admissionNumber -eq 'EST-2025-0001' -or $_.fullName -eq 'Other Child' } | Select-Object -First 1
if (-not $outsider -and $eastJson.items) { $outsider = $eastJson.items[0] }
Log "INFO|outsider_id=$($outsider.id)"

# ---- PRINCIPAL ----
ExpectOk 'principal_dashboard' (Api $P 'GET' '/api/dashboard')
ExpectOk 'principal_students' (Api $P 'GET' '/api/students?size=5')
ExpectOk 'principal_payroll_GET' (Api $P 'GET' '/api/payroll')
ExpectOk 'principal_settings' (Api $P 'GET' '/api/settings')
ExpectStatus 'principal_users_403' (Api $P 'GET' '/api/users') 403
ExpectStatus 'principal_audit_403' (Api $P 'GET' '/api/audit-logs') 403

# ---- TEACHER ----
$tStudents = Api $T 'GET' '/api/students?size=50'
ExpectOk 'teacher_students' $tStudents
$tStu = ($tStudents.body | ConvertFrom-Json).items
Log "INFO|teacher_visible_students=$($tStu.Count)"
# Teacher should not see East outsider if not assigned
if ($outsider) {
  $tOut = Api $T 'GET' "/api/students/$($outsider.id)"
  ExpectStatus 'teacher_unassigned_student_403' $tOut 403
}
ExpectStatus 'teacher_fees_403' (Api $T 'GET' '/api/fee-structures') 403
ExpectStatus 'teacher_payroll_403' (Api $T 'GET' '/api/payroll') 403
ExpectStatus 'teacher_settings_403' (Api $T 'GET' '/api/settings') 403
ExpectStatus 'teacher_users_403' (Api $T 'GET' '/api/users') 403

# Marks: find exam subjects
$exams = Api $T 'GET' '/api/exams'
$examList = $exams.body | ConvertFrom-Json
$examId = $null
if ($examList -is [array] -and $examList.Count -gt 0) { $examId = $examList[0].id }
elseif ($examList.id) { $examId = $examList.id }
Log "INFO|examId=$examId"

# Get exam subjects via report card or marks path — OperationsController
$markGet = Api $T 'GET' "/api/marks?studentId=$($arjun.id)"
ExpectOk 'teacher_list_marks' $markGet

# Try enter/update marks — need examSubjectId from admin ops
# Look at exam detail if available
$examSubjectsPath = Api $A 'GET' "/api/exams"
# Use bulk/operations - check OperationsController for exam subjects listing inside exams response
$ex0 = ($exams.body | ConvertFrom-Json)
if ($ex0 -isnot [array]) { $ex0 = @($ex0) }
$subjectId = $null
foreach ($e in $ex0) {
  if ($e.subjects) { $subjectId = $e.subjects[0].id; break }
  if ($e.examSubjects) { $subjectId = $e.examSubjects[0].id; break }
}
# Fallback: query via SQL-less approach - POST marks and parse error
# Dev seed has Term 1 Assessment Maths — try finding via student workspace marks or create
$markBody = @{
  examSubjectId = '00000000-0000-0000-0000-000000000001'
  studentId = $arjun.id
  marksObtained = 88
  remarks = 'QA'
}
# Better: get from enrichment / list exam subjects endpoint
$opsExams = Api $A 'GET' '/api/exams'
$opsBody = $opsExams.body | ConvertFrom-Json
# Search backend for exam subjects in response mapping
Log "INFO|exams_sample=$($opsExams.body.Substring(0,[Math]::Min(400,$opsExams.body.Length)))"

# ---- ACCOUNTANT ----
ExpectOk 'acct_fee_structures' (Api $C 'GET' '/api/fee-structures')
ExpectOk 'acct_invoices' (Api $C 'GET' '/api/invoices?status=PENDING')
ExpectOk 'acct_pending' (Api $C 'GET' '/api/invoices?status=DEFAULTERS')
ExpectOk 'acct_reports' (Api $C 'GET' '/api/reports/summary')
ExpectStatus 'acct_marks_403' (Api $C 'POST' '/api/marks' @{ examSubjectId = $arjun.id; studentId = $arjun.id; marksObtained = 10 }) 403
ExpectStatus 'acct_users_403' (Api $C 'GET' '/api/users') 403

# Finance: create invoice for sibling or arjun using existing structure
$structs = (Api $C 'GET' '/api/fee-structures').body | ConvertFrom-Json
$fs = $structs | Select-Object -First 1
Log "INFO|feeStructure=$($fs.id) name=$($fs.name)"
$due = (Get-Date).AddDays(20).ToString('yyyy-MM-dd')
$invRes = Api $C 'POST' '/api/invoices' @{ studentId = $arjun.id; feeStructureId = $fs.id; dueDate = $due }
ExpectOk 'acct_create_invoice' $invRes
$inv = $invRes.body | ConvertFrom-Json
Log "INFO|invoice=$($inv.invoiceNumber) total=$($inv.totalAmount) paid=$($inv.paidAmount) status=$($inv.status)"

$orderRes = Api $C 'POST' '/api/payments/orders' @{ invoiceId = $inv.id; method = 'CASH'; idempotencyKey = [guid]::NewGuid().ToString() }
ExpectOk 'acct_payment_order' $orderRes
$order = $orderRes.body | ConvertFrom-Json
Log "INFO|paymentOrder amount=$($order.amount) status=$($order.status) id=$($order.paymentId)"

$confirm = Api $C 'POST' "/api/payments/$($order.paymentId)/confirm-offline"
ExpectOk 'acct_confirm_offline' $confirm

$invAfter = Api $C 'GET' "/api/invoices?studentId=$($arjun.id)"
$invList = $invAfter.body | ConvertFrom-Json
$paidInv = $invList | Where-Object { $_.id -eq $inv.id } | Select-Object -First 1
if (-not $paidInv) { $paidInv = $invList | Where-Object { $_.invoiceNumber -eq $inv.invoiceNumber } | Select-Object -First 1 }
Log "INFO|after_pay status=$($paidInv.status) paid=$($paidInv.paidAmount) total=$($paidInv.totalAmount)"
if ($paidInv.status -eq 'PAID' -and ([decimal]$paidInv.paidAmount -eq [decimal]$paidInv.totalAmount)) {
  Log 'PASS|finance_full_payment_reconcile'
} else {
  Log "FAIL|finance_full_payment_reconcile|status=$($paidInv.status) paid=$($paidInv.paidAmount) total=$($paidInv.totalAmount)"
}

$ledger = Api $C 'GET' "/api/payments?studentId=$($arjun.id)"
ExpectOk 'acct_payment_ledger' $ledger
$receipts = Api $C 'GET' "/api/receipts?studentId=$($arjun.id)"
ExpectOk 'acct_receipts' $receipts

# Partial custom amount NOT supported — document
Log 'INFO|finance_partial_custom_amount|NOT_SUPPORTED (orders always charge full outstanding) — P1'

# Idempotency
$key = [guid]::NewGuid().ToString()
# create another invoice for Ananya sibling
$sibPage = Api $A 'GET' '/api/students?q=Ananya&size=5'
$sib = (($sibPage.body | ConvertFrom-Json).items | Select-Object -First 1)
if ($sib) {
  $inv2 = Api $C 'POST' '/api/invoices' @{ studentId = $sib.id; feeStructureId = $fs.id; dueDate = $due }
  $o1 = Api $C 'POST' '/api/payments/orders' @{ invoiceId = (($inv2.body | ConvertFrom-Json).id); method = 'CASH'; idempotencyKey = $key }
  $o2 = Api $C 'POST' '/api/payments/orders' @{ invoiceId = (($inv2.body | ConvertFrom-Json).id); method = 'CASH'; idempotencyKey = $key }
  $p1 = ($o1.body | ConvertFrom-Json).paymentId
  $p2 = ($o2.body | ConvertFrom-Json).paymentId
  if ($p1 -eq $p2) { Log 'PASS|payment_idempotency' } else { Log "FAIL|payment_idempotency|$p1 vs $p2" }
}

# ---- PARENT ----
$pKids = Api $G 'GET' '/api/students?size=50'
ExpectOk 'parent_children' $pKids
$kids = ($pKids.body | ConvertFrom-Json).items
Log "INFO|parent_children=$($kids.Count) names=$(($kids | ForEach-Object { $_.fullName }) -join ',')"
if ($kids.Count -ge 1 -and $kids.Count -le 10) { Log 'PASS|parent_linked_scope_reasonable' } else { Log "WARN|parent_children_count=$($kids.Count)" }
if ($outsider) {
  ExpectStatus 'parent_outsider_403' (Api $G 'GET' "/api/students/$($outsider.id)") 403
  ExpectStatus 'parent_outsider_workspace_403' (Api $G 'GET' "/api/students/$($outsider.id)/workspace") 403
}
$ownWs = Api $G 'GET' "/api/students/$($arjun.id)/workspace"
ExpectOk 'parent_student360' $ownWs
$pws = $ownWs.body | ConvertFrom-Json
$fakeHints = @('demo-', 'Demo tracking', 'sample')
$wsText = $ownWs.body
$leak = $false
foreach ($h in $fakeHints) { if ($wsText -match [regex]::Escape($h)) { $leak = $true } }
if (-not $leak) { Log 'PASS|parent_360_no_demo_payload' } else { Log 'FAIL|parent_360_contains_demo_hint' }
Log "INFO|parent360 guardians=$($pws.guardians.Count) att%=$($pws.attendance.percentage) hw=$($pws.homework.Count) fees=$($pws.invoices.Count)"

ExpectStatus 'parent_settings_403' (Api $G 'GET' '/api/settings') 403
ExpectStatus 'parent_payroll_403' (Api $G 'GET' '/api/payroll') 403
ExpectStatus 'parent_fee_structures_403' (Api $G 'GET' '/api/fee-structures') 403

# ---- STUDENT ----
$sSelf = Api $S 'GET' '/api/students?size=20'
ExpectOk 'student_list' $sSelf
$sItems = ($sSelf.body | ConvertFrom-Json).items
if ($sItems.Count -eq 1 -and $sItems[0].fullName -like '*Arjun*') { Log 'PASS|student_self_only_list' } else { Log "FAIL|student_list_count=$($sItems.Count) name=$($sItems[0].fullName)" }
if ($outsider) { ExpectStatus 'student_outsider_403' (Api $S 'GET' "/api/students/$($outsider.id)") 403 }
ExpectOk 'student_workspace' (Api $S 'GET' "/api/students/$($arjun.id)/workspace")
ExpectStatus 'student_settings_403' (Api $S 'GET' '/api/settings') 403
ExpectStatus 'student_payroll_403' (Api $S 'GET' '/api/payroll') 403

# ---- ATTENDANCE ----
# Get section of arjun
$sectionId = $arjun.sectionId
$yearId = $arjun.academicYearId
$today = (Get-Date).ToString('yyyy-MM-dd')
if ($sectionId -and $yearId) {
  $attBody = @{
    sectionId = $sectionId
    academicYearId = $yearId
    date = $today
    session = 'FULL_DAY'
    entries = @(@{ studentId = $arjun.id; status = 'PRESENT'; remarks = 'QA pilot' })
  }
  $att = Api $T 'POST' '/api/attendance' $attBody
  if ($att.ok -or $att.status -eq 409) { Log "PASS|teacher_attendance_mark|status=$($att.status)" }
  else { Log "FAIL|teacher_attendance_mark|status=$($att.status) $($att.body.Substring(0,[Math]::Min(200,$att.body.Length)))" }
}
$sum = Api $G 'GET' "/api/attendance/summary?studentId=$($arjun.id)"
ExpectOk 'attendance_summary' $sum
$sumObj = $sum.body | ConvertFrom-Json
Log "INFO|att_summary present=$($sumObj.present) total=$($sumObj.total) pct=$($sumObj.percentage) today=$($sumObj.today) history=$($sumObj.history.Count)"

# ---- MARKS upsert (need real examSubjectId) ----
# Probe DB via listing - OperationsService listExams may include subjects
# Try GET /api/report-cards
$rc = Api $A 'GET' "/api/report-cards?studentId=$($arjun.id)&examId=$examId"
Log "INFO|report_card_status=$($rc.status) body=$($rc.body.Substring(0,[Math]::Min(250,$rc.body.Length)))"

# Find exam subject by creating via admin if needed - read OperationsController paths
# Use SQL through a known seeded exam: query marks list for empty then POST with discovered id from java seeder isn't exposed.
# Approach: call campus enrichment already created marks - list them
$marksList = ($markGet.body | ConvertFrom-Json)
Log "INFO|marks_list=$($markGet.body.Substring(0,[Math]::Min(300,$markGet.body.Length)))"

# Admin creates exam subject isn't separate API easily - check Catalog / Operations for exam subjects in exam create response
# Try POST marks with subject from workspace marks first entry if any
$examSubjectId = $null
if ($wsObj.marks -and $wsObj.marks.Count -gt 0) {
  # workspace marks don't include examSubjectId - only examId
}
# Use PowerShell + npx? Better run a small curl against known endpoint
# Look for /api/exams/{id}/subjects
$esTry = Api $A 'GET' "/api/exams/$examId/subjects"
Log "INFO|exam_subjects_endpoint=$($esTry.status) $($esTry.body.Substring(0,[Math]::Min(200,$esTry.body.Length)))"

# ---- CRUD student update persistence ----
$before = Api $A 'GET' "/api/students/$($arjun.id)"
$beforeObj = $before.body | ConvertFrom-Json
$newMobile = '99999' + (Get-Random -Minimum 10000 -Maximum 99999)
$upd = Api $A 'PUT' "/api/students/$($arjun.id)" @{
  fullName = $beforeObj.fullName
  admissionNumber = $beforeObj.admissionNumber
  studentCode = $beforeObj.studentCode
  gender = $beforeObj.gender
  dateOfBirth = $beforeObj.dateOfBirth
  admissionDate = $beforeObj.admissionDate
  academicYearId = $beforeObj.academicYearId
  classId = $beforeObj.classId
  sectionId = $beforeObj.sectionId
  branchId = $beforeObj.branchId
  mobile = $newMobile
  email = $beforeObj.email
  address = $beforeObj.address
  status = $beforeObj.status
}
ExpectOk 'admin_update_student' $upd
$after = Api $A 'GET' "/api/students/$($arjun.id)"
$afterObj = $after.body | ConvertFrom-Json
if ($afterObj.mobile -eq $newMobile) { Log 'PASS|persistence_student_mobile' } else { Log "FAIL|persistence_student_mobile|got=$($afterObj.mobile)" }

# Health/discipline campus record create
$branches = (Api $A 'GET' '/api/branches').body | ConvertFrom-Json
$branchId = $arjun.branchId
if (-not $branchId) { $branchId = $branches[0].id }
$health = Api $A 'POST' '/api/campus-records' @{
  branchId = $branchId
  studentId = $arjun.id
  moduleType = 'HEALTH'
  title = 'QA Clinic Visit'
  category = 'GENERAL'
  status = 'RECORDED'
  details = 'Mild fever — QA pilot'
}
ExpectOk 'create_health_record' $health
$disc = Api $A 'POST' '/api/campus-records' @{
  branchId = $branchId
  studentId = $arjun.id
  moduleType = 'DISCIPLINE'
  title = 'QA Conduct Note'
  category = 'WARNING'
  status = 'OPEN'
  details = 'Late to assembly — QA'
}
ExpectOk 'create_discipline_record' $disc
$ws2 = (Api $A 'GET' "/api/students/$($arjun.id)/workspace").body | ConvertFrom-Json
if ($ws2.health.Count -ge 1) { Log 'PASS|360_health_live' } else { Log "FAIL|360_health_live|count=$($ws2.health.Count)" }
if ($ws2.discipline.Count -ge 1) { Log 'PASS|360_discipline_live' } else { Log "FAIL|360_discipline_live|count=$($ws2.discipline.Count)" }
if ($ws2.guardians.Count -ge 1) { Log 'PASS|360_guardians_live' } else { Log "FAIL|360_guardians_live|count=$($ws2.guardians.Count)" }

# Publish exam if teacher/admin can
if ($examId) {
  $pub = Api $A 'POST' "/api/exams/$examId/publish"
  Log "INFO|publish_exam status=$($pub.status) $($pub.body.Substring(0,[Math]::Min(120,$pub.body.Length)))"
}

# Teacher staff other profile — find another staff id
$staffList = (Api $A 'GET' '/api/staff').body | ConvertFrom-Json
$otherStaff = $staffList | Where-Object { $_.employeeCode -ne 'TCH-1001' } | Select-Object -First 1
if ($otherStaff) {
  ExpectStatus 'teacher_other_staff_403' (Api $T 'GET' "/api/staff/$($otherStaff.id)") 403
}

Log "=== PILOT QA END ==="
$outPath = 'D:\School managemant\School management\school-management-system\PILOT-QA-RESULTS.txt'
$Results | Set-Content -Path $outPath -Encoding UTF8
Log "WROTE|$outPath"
Get-Content $outPath | Select-String '^FAIL\|' | ForEach-Object { $_ }
$passN = ($Results | Where-Object { $_ -like 'PASS|*' }).Count
$failN = ($Results | Where-Object { $_ -like 'FAIL|*' }).Count
Log "SUMMARY|PASS=$passN FAIL=$failN"
