package com.schoolgroup.sms.service;

import com.schoolgroup.sms.entity.CampusRecord;
import com.schoolgroup.sms.entity.Homework;
import com.schoolgroup.sms.entity.Invoice;
import com.schoolgroup.sms.entity.LeaveRequest;
import com.schoolgroup.sms.entity.Mark;
import com.schoolgroup.sms.entity.Staff;
import com.schoolgroup.sms.entity.Student;
import com.schoolgroup.sms.entity.StudentAttendance;
import com.schoolgroup.sms.entity.TeacherAssignment;
import com.schoolgroup.sms.entity.TimetableSlot;
import com.schoolgroup.sms.exception.ApiException;
import com.schoolgroup.sms.repository.AcademicYearRepository;
import com.schoolgroup.sms.repository.BookLoanRepository;
import com.schoolgroup.sms.repository.CampusRecordRepository;
import com.schoolgroup.sms.repository.GuardianStudentRepository;
import com.schoolgroup.sms.repository.HomeworkRepository;
import com.schoolgroup.sms.repository.InvoiceRepository;
import com.schoolgroup.sms.repository.LeaveRequestRepository;
import com.schoolgroup.sms.repository.MarkRepository;
import com.schoolgroup.sms.repository.StaffRepository;
import com.schoolgroup.sms.repository.StudentAttendanceRepository;
import com.schoolgroup.sms.repository.StudentRepository;
import com.schoolgroup.sms.repository.StudentTransportRepository;
import com.schoolgroup.sms.repository.TeacherAssignmentRepository;
import com.schoolgroup.sms.repository.TimetableSlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ProfileWorkspaceService {

    private final AccessService access;
    private final StudentRepository students;
    private final StaffRepository staff;
    private final StudentAttendanceRepository attendance;
    private final HomeworkRepository homework;
    private final InvoiceRepository invoices;
    private final MarkRepository marks;
    private final BookLoanRepository loans;
    private final StudentTransportRepository transports;
    private final LeaveRequestRepository leaves;
    private final TimetableSlotRepository timetable;
    private final TeacherAssignmentRepository assignments;
    private final AcademicYearRepository years;
    private final GuardianStudentRepository guardianLinks;
    private final CampusRecordRepository campusRecords;

    public ProfileWorkspaceService(AccessService access, StudentRepository students, StaffRepository staff,
                                   StudentAttendanceRepository attendance, HomeworkRepository homework,
                                   InvoiceRepository invoices, MarkRepository marks, BookLoanRepository loans,
                                   StudentTransportRepository transports, LeaveRequestRepository leaves,
                                   TimetableSlotRepository timetable, TeacherAssignmentRepository assignments,
                                   AcademicYearRepository years, GuardianStudentRepository guardianLinks,
                                   CampusRecordRepository campusRecords) {
        this.access = access;
        this.students = students;
        this.staff = staff;
        this.attendance = attendance;
        this.homework = homework;
        this.invoices = invoices;
        this.marks = marks;
        this.loans = loans;
        this.transports = transports;
        this.leaves = leaves;
        this.timetable = timetable;
        this.assignments = assignments;
        this.years = years;
        this.guardianLinks = guardianLinks;
        this.campusRecords = campusRecords;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> studentWorkspace(UUID studentId) {
        Student student = access.requireStudentAccess(studentId);
        List<StudentAttendance> rows = attendance.findByStudentIdOrderByAttendanceDateDesc(student.getId());
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("studentId", student.getId());
        out.put("guardians", guardianLinks.findByStudentId(student.getId()).stream().map(link -> {
            Map<String, Object> row = new LinkedHashMap<>();
            var g = link.getGuardian();
            row.put("id", g.getId());
            row.put("fullName", g.getFullName());
            row.put("mobile", g.getMobile());
            row.put("email", g.getEmail() == null ? "" : g.getEmail());
            row.put("relationship", link.getRelationship());
            row.put("primary", link.isPrimaryGuardian());
            row.put("occupation", g.getOccupation() == null ? "" : g.getOccupation());
            row.put("address", g.getAddress() == null ? "" : g.getAddress());
            return row;
        }).toList());
        out.put("attendance", attendanceBlock(rows));
        out.put("homework", student.getSection() == null ? List.of()
                : homework.findBySectionId(student.getSection().getId()).stream().map(this::homeworkRow).toList());
        out.put("invoices", invoices.findByStudentIdOrderByIssueDateDesc(student.getId()).stream().map(this::invoiceRow).toList());
        out.put("marks", marks.findByStudentId(student.getId()).stream().map(this::markRow).toList());
        out.put("exams", distinctExams(marks.findByStudentId(student.getId())));
        out.put("library", loans.findByStudentId(student.getId()).stream().map(l -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", l.getId());
            row.put("title", l.getCopy().getBook().getTitle());
            row.put("copyCode", l.getCopy().getCopyCode());
            row.put("status", l.getStatus());
            row.put("dueDate", l.getDueDate() == null ? "" : l.getDueDate().toString());
            row.put("issuedAt", l.getIssuedAt() == null ? "" : l.getIssuedAt().toString());
            return row;
        }).toList());
        out.put("transport", transports.findByStudentId(student.getId()).stream().map(t -> Map.<String, Object>of(
                "route", t.getRoute().getName(),
                "stop", t.getStop().getName(),
                "vehicle", t.getRoute().getVehicle() == null ? "" : t.getRoute().getVehicle().getRegistrationNumber(),
                "driver", t.getRoute().getDriver() == null ? "" : t.getRoute().getDriver().getFullName(),
                "status", t.getStatus()
        )).toList());
        out.put("leave", leaves.findByStudentId(student.getId()).stream().map(this::leaveRow).toList());
        UUID yearId = student.getAcademicYear() != null ? student.getAcademicYear().getId()
                : years.findFirstByStatus("ACTIVE").map(y -> y.getId()).orElse(null);
        out.put("timetable", student.getSection() == null || yearId == null ? List.of()
                : timetable.findBySectionIdAndAcademicYearId(student.getSection().getId(), yearId).stream()
                .map(this::slotRow).toList());
        out.put("health", campusRecords.findByModuleTypeAndStudentIdOrderByUpdatedAtDesc("HEALTH", student.getId())
                .stream().map(this::campusRow).toList());
        out.put("discipline", campusRecords.findByModuleTypeAndStudentIdOrderByUpdatedAtDesc("DISCIPLINE", student.getId())
                .stream().map(this::campusRow).toList());
        out.put("activity", activity(student, rows));
        return out;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> staffWorkspace(UUID staffId) {
        Staff teacher = staff.findById(staffId).orElseThrow(() -> ApiException.notFound("Staff not found"));
        access.assertBranch(teacher.getBranch().getId());
        List<TeacherAssignment> assigned = assignments.findByStaffId(teacher.getId());
        UUID yearId = years.findFirstByStatus("ACTIVE").map(y -> y.getId()).orElse(null);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("staffId", teacher.getId());
        out.put("assignments", assigned.stream().map(a -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", a.getId());
            row.put("subject", a.getSubject().getName());
            row.put("className", a.getSchoolClass().getName());
            row.put("sectionName", a.getSection().getName());
            row.put("sectionId", a.getSection().getId());
            row.put("classId", a.getSchoolClass().getId());
            row.put("year", a.getAcademicYear().getName());
            return row;
        }).toList());
        out.put("timetable", yearId == null ? List.of()
                : timetable.findByStaffIdAndAcademicYearId(teacher.getId(), yearId).stream().map(this::slotRow).toList());
        out.put("homework", homework.findByStaffId(teacher.getId()).stream().map(this::homeworkRow).toList());
        out.put("leave", leaves.findByStaffId(teacher.getId()).stream().map(this::leaveRow).toList());
        List<Map<String, Object>> roster = new ArrayList<>();
        assigned.stream().limit(3).forEach(a -> students.findBySectionIdAndStatus(a.getSection().getId(), "ACTIVE")
                .stream().limit(12).forEach(s -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", s.getId());
                    row.put("fullName", s.getFullName());
                    row.put("admissionNumber", s.getAdmissionNumber());
                    row.put("className", s.getSchoolClass() == null ? "" : s.getSchoolClass().getName());
                    row.put("sectionName", s.getSection() == null ? "" : s.getSection().getName());
                    roster.add(row);
                }));
        out.put("students", roster);
        return out;
    }

    private Map<String, Object> campusRow(CampusRecord r) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", r.getId());
        row.put("title", r.getTitle());
        row.put("category", r.getCategory() == null ? "" : r.getCategory());
        row.put("status", r.getStatus());
        row.put("scheduledAt", r.getScheduledAt() == null ? "" : r.getScheduledAt().toString());
        row.put("location", r.getLocation() == null ? "" : r.getLocation());
        row.put("details", r.getDetails() == null ? "" : r.getDetails());
        row.put("updatedAt", r.getUpdatedAt() == null ? "" : r.getUpdatedAt().toString());
        return row;
    }

    private Map<String, Object> attendanceBlock(List<StudentAttendance> rows) {
        long present = rows.stream().filter(r -> "PRESENT".equals(r.getStatus()) || "LATE".equals(r.getStatus())).count();
        long late = rows.stream().filter(r -> "LATE".equals(r.getStatus())).count();
        long absent = rows.stream().filter(r -> "ABSENT".equals(r.getStatus())).count();
        long leave = rows.stream().filter(r -> "LEAVE".equals(r.getStatus())).count();
        long total = rows.size();
        BigDecimal pct = total == 0 ? BigDecimal.ZERO
                : BigDecimal.valueOf(present * 100.0 / total).setScale(1, RoundingMode.HALF_UP);
        Map<String, Object> block = new LinkedHashMap<>();
        block.put("percentage", pct);
        block.put("present", present);
        block.put("late", late);
        block.put("absent", absent);
        block.put("leave", leave);
        block.put("total", total);
        block.put("records", rows.stream().limit(60).map(r -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("date", r.getAttendanceDate().toString());
            row.put("status", r.getStatus());
            row.put("session", r.getSession());
            return row;
        }).toList());
        return block;
    }

    private Map<String, Object> homeworkRow(Homework h) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", h.getId());
        row.put("title", h.getTitle());
        row.put("description", h.getDescription());
        row.put("dueDate", h.getDueDate() == null ? "" : h.getDueDate().toString());
        row.put("subject", h.getSubject().getName());
        row.put("teacher", h.getStaff().getUser().getFullName());
        row.put("className", h.getSchoolClass().getName());
        row.put("sectionName", h.getSection().getName());
        row.put("status", h.getDueDate() != null && h.getDueDate().isBefore(LocalDate.now()) ? "OVERDUE" : "OPEN");
        row.put("attachmentFileId", h.getAttachmentFileId() == null ? "" : h.getAttachmentFileId().toString());
        return row;
    }

    private Map<String, Object> invoiceRow(Invoice inv) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", inv.getId());
        row.put("invoiceNumber", inv.getInvoiceNumber());
        row.put("status", inv.getStatus());
        row.put("totalAmount", inv.getTotalAmount());
        row.put("paidAmount", inv.getPaidAmount());
        row.put("dueDate", inv.getDueDate() == null ? "" : inv.getDueDate().toString());
        return row;
    }

    private Map<String, Object> markRow(Mark m) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", m.getId());
        row.put("exam", m.getExamSubject().getExam().getName());
        row.put("examId", m.getExamSubject().getExam().getId());
        row.put("subject", m.getExamSubject().getSubject().getName());
        row.put("marksObtained", m.getMarksObtained());
        row.put("maxMarks", m.getExamSubject().getMaxMarks());
        row.put("grade", m.getGrade());
        row.put("remarks", m.getRemarks() == null ? "" : m.getRemarks());
        return row;
    }

    private List<Map<String, Object>> distinctExams(List<Mark> studentMarks) {
        Map<UUID, Map<String, Object>> seen = new LinkedHashMap<>();
        for (Mark m : studentMarks) {
            var exam = m.getExamSubject().getExam();
            seen.putIfAbsent(exam.getId(), Map.of(
                    "id", exam.getId(),
                    "name", exam.getName(),
                    "examType", exam.getExamType(),
                    "startDate", exam.getStartDate().toString(),
                    "endDate", exam.getEndDate().toString(),
                    "status", exam.getStatus()
            ));
        }
        return new ArrayList<>(seen.values());
    }

    private Map<String, Object> leaveRow(LeaveRequest l) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", l.getId());
        row.put("leaveType", l.getLeaveType());
        row.put("startDate", l.getStartDate().toString());
        row.put("endDate", l.getEndDate().toString());
        row.put("reason", l.getReason());
        row.put("status", l.getStatus());
        return row;
    }

    private Map<String, Object> slotRow(TimetableSlot s) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", s.getId());
        row.put("dayOfWeek", s.getDayOfWeek());
        row.put("startTime", s.getStartTime() == null ? "" : s.getStartTime().toString());
        row.put("endTime", s.getEndTime() == null ? "" : s.getEndTime().toString());
        row.put("room", s.getRoom() == null ? "" : s.getRoom());
        row.put("subject", s.getSubject().getName());
        row.put("teacher", s.getStaff().getUser().getFullName());
        row.put("className", s.getSchoolClass().getName());
        row.put("sectionName", s.getSection().getName());
        return row;
    }

    private List<Map<String, Object>> activity(Student student, List<StudentAttendance> rows) {
        List<Map<String, Object>> events = new ArrayList<>();
        rows.stream().limit(4).forEach(r -> events.add(Map.of(
                "when", r.getAttendanceDate().toString(),
                "title", "Attendance " + r.getStatus(),
                "detail", r.getSession()
        )));
        invoices.findByStudentIdOrderByIssueDateDesc(student.getId()).stream().limit(3).forEach(inv ->
                events.add(Map.of(
                        "when", inv.getIssueDate().toString(),
                        "title", "Invoice " + inv.getInvoiceNumber(),
                        "detail", inv.getStatus()
                )));
        return events;
    }
}
