package com.schoolgroup.sms.controller;

import com.schoolgroup.sms.dto.PageResponse;
import com.schoolgroup.sms.dto.SchoolDtos;
import com.schoolgroup.sms.entity.Complaint;
import com.schoolgroup.sms.entity.Homework;
import com.schoolgroup.sms.entity.LeaveRequest;
import com.schoolgroup.sms.entity.Notice;
import com.schoolgroup.sms.entity.TimetableSlot;
import com.schoolgroup.sms.service.NotificationService;
import com.schoolgroup.sms.service.OperationsService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@org.springframework.transaction.annotation.Transactional
public class OperationsController {

    private final OperationsService operations;
    private final NotificationService notifications;

    public OperationsController(OperationsService operations, NotificationService notifications) {
        this.operations = operations;
        this.notifications = notifications;
    }

    @PostMapping("/attendance")
    public Map<String, String> attendance(@Valid @RequestBody SchoolDtos.AttendanceSubmitRequest request) {
        operations.submitAttendance(request);
        return Map.of("status", "saved");
    }

    @GetMapping("/attendance/summary")
    public Map<String, Object> attendanceSummary(@RequestParam UUID studentId,
                                                 @RequestParam(required = false) LocalDate from,
                                                 @RequestParam(required = false) LocalDate to) {
        return operations.attendanceSummary(studentId, from, to);
    }

    @GetMapping("/attendance/report")
    public Map<String, Object> attendanceReport(@RequestParam UUID sectionId,
                                                @RequestParam(required = false) LocalDate date,
                                                @RequestParam(required = false) String session) {
        return operations.attendanceReport(sectionId, date, session);
    }

    @GetMapping("/staff-attendance")
    public List<Map<String, Object>> staffAttendance(@RequestParam(required = false) LocalDate date) {
        return operations.listStaffAttendance(date);
    }

    @GetMapping("/staff-attendance/summary")
    public Map<String, Object> staffAttendanceSummary(@RequestParam(required = false) LocalDate from,
                                                      @RequestParam(required = false) LocalDate to,
                                                      @RequestParam(required = false) UUID staffId) {
        return operations.staffAttendanceSummary(from, to, staffId);
    }

    @PostMapping("/staff-attendance")
    public Map<String, String> submitStaffAttendance(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> entries = (List<Map<String, Object>>) body.getOrDefault("entries", List.of());
        LocalDate date = body.get("date") == null ? LocalDate.now() : LocalDate.parse(String.valueOf(body.get("date")));
        operations.submitStaffAttendance(entries, date);
        return Map.of("status", "saved");
    }

    @PostMapping("/timetable")
    public TimetableSlot createSlot(@Valid @RequestBody SchoolDtos.TimetableRequest request) {
        return operations.createSlot(request);
    }

    @GetMapping("/timetable")
    public List<TimetableSlot> timetable(@RequestParam UUID academicYearId,
                                         @RequestParam(required = false) UUID studentId,
                                         @RequestParam(required = false) UUID sectionId) {
        if (sectionId != null) {
            return operations.timetableForSection(sectionId, academicYearId);
        }
        if (studentId != null) {
            return operations.timetableForStudent(studentId, academicYearId);
        }
        return operations.myTimetable(academicYearId);
    }

    @PostMapping("/homework")
    public Map<String, Object> homework(@Valid @RequestBody SchoolDtos.HomeworkRequest request) {
        var hw = operations.createHomework(request);
        return Map.of(
                "id", hw.getId(),
                "title", hw.getTitle(),
                "dueDate", hw.getDueDate().toString(),
                "attachmentFileId", hw.getAttachmentFileId() == null ? "" : hw.getAttachmentFileId().toString()
        );
    }

    @GetMapping("/homework")
    public List<Map<String, Object>> listHomework(@RequestParam(required = false) UUID sectionId,
                                                  @RequestParam(required = false) UUID studentId) {
        return operations.listHomework(sectionId, studentId);
    }

    @PostMapping("/homework/{id}/submit")
    public Map<String, String> submitHomework(@PathVariable UUID id) {
        operations.submitHomework(id);
        return Map.of("status", "submitted");
    }

    @PostMapping("/exams")
    public Map<String, Object> exam(@Valid @RequestBody SchoolDtos.ExamRequest request) {
        var exam = operations.createExam(request);
        return Map.of("id", exam.getId(), "name", exam.getName(), "status", exam.getStatus());
    }

    @GetMapping("/exams")
    public List<Map<String, Object>> exams() {
        return operations.listExams();
    }

    @PostMapping("/exams/{id}/publish")
    public Map<String, Object> publishExam(@PathVariable UUID id) {
        var exam = operations.publishExam(id);
        return Map.of("id", exam.getId(), "name", exam.getName(), "status", exam.getStatus());
    }

    @GetMapping("/exams/{id}/subjects")
    public List<Map<String, Object>> examSubjects(@PathVariable UUID id) {
        return operations.listExamSubjects(id);
    }

    @PostMapping("/marks")
    public Map<String, Object> marks(@Valid @RequestBody SchoolDtos.MarkRequest request) {
        var mark = operations.enterMarks(request);
        return Map.of("id", mark.getId(), "grade", mark.getGrade(), "marks", mark.getMarksObtained());
    }

    @GetMapping("/marks")
    public List<Map<String, Object>> listMarks(@RequestParam UUID studentId) {
        return operations.listMarks(studentId);
    }

    @GetMapping("/report-cards")
    public Map<String, Object> reportCard(@RequestParam UUID studentId, @RequestParam UUID examId) {
        return operations.reportCard(studentId, examId);
    }

    @PostMapping("/leave")
    public LeaveRequest leave(@Valid @RequestBody SchoolDtos.LeaveCreateRequest request) {
        return operations.createLeave(request);
    }

    @GetMapping("/leave")
    public List<Map<String, Object>> listLeave() {
        return operations.listLeave();
    }

    @PostMapping("/leave/{id}/review")
    public LeaveRequest review(@PathVariable UUID id, @RequestParam boolean approved,
                               @RequestParam(required = false) String note) {
        return operations.reviewLeave(id, approved, note);
    }

    @PostMapping("/notices")
    public Notice notice(@Valid @RequestBody SchoolDtos.NoticeRequest request) {
        return operations.createNotice(request);
    }

    @GetMapping("/notices")
    public List<Notice> notices() {
        return operations.visibleNotices();
    }

    @PostMapping("/complaints")
    public Complaint complaint(@Valid @RequestBody SchoolDtos.ComplaintRequest request) {
        return operations.createComplaint(request);
    }

    @GetMapping("/complaints")
    public List<Complaint> complaints() {
        return operations.myComplaints();
    }

    @PostMapping("/complaints/{id}/comments")
    public Map<String, String> comment(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        operations.addComplaintComment(id, body.getOrDefault("body", ""));
        return Map.of("status", "added");
    }

    @GetMapping("/notifications")
    public PageResponse<Map<String, Object>> notifications(@RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "20") int size) {
        Page<?> result = notifications.myNotifications(page, size);
        var items = result.getContent().stream().map(n -> Map.<String, Object>of(
                "id", ((com.schoolgroup.sms.entity.Notification) n).getId(),
                "type", ((com.schoolgroup.sms.entity.Notification) n).getType(),
                "title", ((com.schoolgroup.sms.entity.Notification) n).getTitle(),
                "body", ((com.schoolgroup.sms.entity.Notification) n).getBody(),
                "read", ((com.schoolgroup.sms.entity.Notification) n).getReadAt() != null,
                "createdAt", ((com.schoolgroup.sms.entity.Notification) n).getCreatedAt().toString()
        )).toList();
        return new PageResponse<>(items, result.getTotalElements(), page, size);
    }

    @PostMapping("/notifications/{id}/read")
    public Map<String, String> read(@PathVariable UUID id) {
        notifications.markRead(id);
        return Map.of("status", "read");
    }

    @PostMapping("/notifications/read-all")
    public Map<String, String> readAll() {
        notifications.markAllRead();
        return Map.of("status", "read");
    }

    @GetMapping("/notifications/unread-count")
    public Map<String, Long> unread() {
        return Map.of("count", notifications.unreadCount());
    }
}
