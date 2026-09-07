package com.schoolgroup.sms.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public final class SchoolDtos {

    private SchoolDtos() {
    }

    public record BranchRequest(
            @NotBlank String name,
            @NotBlank String code,
            String address,
            String phone,
            @Email String email,
            String status
    ) {
    }

    public record BranchResponse(UUID id, String name, String code, String address, String phone, String email,
                                 String status, String city, String state, String pincode, String principalName) {
    }

    public record AcademicYearRequest(@NotBlank String name, @NotNull LocalDate startDate, @NotNull LocalDate endDate,
                                      String status) {
    }

    public record AcademicYearResponse(UUID id, String name, LocalDate startDate, LocalDate endDate, String status) {
    }

    public record ClassRequest(@NotBlank String name, @NotNull Integer gradeLevel, UUID branchId, String status) {
    }

    public record ClassResponse(UUID id, UUID branchId, String name, Integer gradeLevel, String status) {
    }

    public record SectionRequest(@NotBlank String name, Integer capacity, String status) {
    }

    public record SectionResponse(UUID id, UUID classId, String name, Integer capacity, String status) {
    }

    public record SectionDetailResponse(
            UUID id, UUID classId, String className, Integer gradeLevel, UUID branchId, String branchName,
            String name, Integer capacity, String status, long studentCount, String classTeacherName
    ) {
    }

    public record SubjectRequest(@NotBlank String name, @NotBlank String code, UUID branchId, String status) {
    }

    public record SubjectResponse(UUID id, UUID branchId, String name, String code, String status) {
    }

    public record StudentRequest(
            UUID branchId,
            @NotNull UUID academicYearId,
            UUID classId,
            UUID sectionId,
            @NotBlank String admissionNumber,
            @NotBlank String studentCode,
            @NotBlank String fullName,
            @NotNull LocalDate dateOfBirth,
            @NotBlank String gender,
            String mobile,
            String email,
            String address,
            @NotNull LocalDate admissionDate,
            String status,
            UUID guardianId,
            String guardianRelationship
    ) {
    }

    public record StudentResponse(
            UUID id, UUID branchId, String branchName, UUID academicYearId, String academicYear,
            UUID classId, String className, UUID sectionId, String sectionName,
            String admissionNumber, String studentCode, String fullName, LocalDate dateOfBirth,
            String gender, String mobile, String email, String address, LocalDate admissionDate, String status,
            String fatherName, String motherName, String bloodGroup, String city, String state, String pincode,
            String emergencyContact, String rollNumber
    ) {
    }

    public record StudentSummary(long total, long boys, long girls, long classes, long branches, long active) {
    }

    public record GuardianRequest(@NotBlank String fullName, @NotBlank String mobile, String email, String address,
                                  String occupation) {
    }

    public record GuardianResponse(UUID id, String fullName, String mobile, String email, String address,
                                   String occupation, String status) {
    }

    public record StaffRequest(
            UUID branchId,
            @NotBlank String fullName,
            @NotBlank @Email String email,
            String mobile,
            @NotBlank String employeeCode,
            @NotBlank String designation,
            @NotBlank String staffType,
            String qualification,
            @NotNull LocalDate joiningDate,
            String role
    ) {
    }

    public record StaffResponse(UUID id, UUID userId, UUID branchId, String fullName, String email, String employeeCode,
                                String designation, String staffType, String qualification, LocalDate joiningDate,
                                String status) {
    }

    public record TimetableRequest(
            UUID branchId,
            @NotNull UUID academicYearId,
            @NotNull UUID classId,
            @NotNull UUID sectionId,
            @NotNull UUID subjectId,
            @NotNull UUID staffId,
            @NotNull Integer dayOfWeek,
            @NotBlank String startTime,
            @NotBlank String endTime,
            String room
    ) {
    }

    public record AttendanceItem(@NotNull UUID studentId, @NotBlank String status, String remarks) {
    }

    public record AttendanceSubmitRequest(
            @NotNull UUID sectionId,
            @NotNull UUID academicYearId,
            @NotNull LocalDate date,
            String session,
            java.util.List<AttendanceItem> entries
    ) {
    }

    public record HomeworkRequest(
            UUID academicYearId,
            @NotNull UUID classId,
            @NotNull UUID sectionId,
            @NotNull UUID subjectId,
            @NotBlank String title,
            @NotBlank String description,
            @NotNull LocalDate dueDate
    ) {
    }

    public record ExamRequest(UUID branchId, @NotNull UUID academicYearId, @NotBlank String name,
                              @NotBlank String examType, @NotNull LocalDate startDate, @NotNull LocalDate endDate) {
    }

    public record MarkRequest(@NotNull UUID examSubjectId, @NotNull UUID studentId,
                              @NotNull java.math.BigDecimal marksObtained, String remarks) {
    }

    public record LeaveCreateRequest(UUID studentId, @NotBlank String leaveType, @NotNull LocalDate startDate,
                                     @NotNull LocalDate endDate, @NotBlank String reason) {
    }

    public record NoticeRequest(UUID branchId, @NotBlank String title, @NotBlank String body,
                                @NotBlank String audienceType, UUID classId, UUID sectionId, String roleTarget) {
    }

    public record ComplaintRequest(UUID studentId, @NotBlank String category, @NotBlank String title,
                                   @NotBlank String description) {
    }

    public record FeeStructureRequest(UUID branchId, @NotNull UUID academicYearId, @NotNull UUID classId,
                                      @NotBlank String name) {
    }

    public record FeeComponentRequest(@NotBlank String name, @NotBlank String componentType,
                                      @NotNull java.math.BigDecimal amount) {
    }

    public record InvoiceGenerateRequest(@NotNull UUID studentId, @NotNull UUID feeStructureId,
                                         @NotNull LocalDate dueDate) {
    }

    public record PaymentOrderRequest(@NotNull UUID invoiceId, @NotBlank String method, String idempotencyKey) {
    }
}
