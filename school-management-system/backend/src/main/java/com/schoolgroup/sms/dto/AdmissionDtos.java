package com.schoolgroup.sms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public final class AdmissionDtos {
    private AdmissionDtos() {
    }

    public record EnquiryRequest(
            UUID branchId,
            UUID academicYearId,
            UUID interestedClassId,
            @NotBlank String studentName,
            String parentName,
            @NotBlank String mobile,
            String email,
            String source,
            String notes
    ) {
    }

    public record EnquiryResponse(
            UUID id, UUID branchId, String branchName, UUID academicYearId, UUID interestedClassId,
            String studentName, String parentName, String mobile, String email, String source, String notes, String status
    ) {
    }

    public record ApplicationRequest(
            UUID branchId,
            @NotNull UUID academicYearId,
            UUID enquiryId,
            UUID classId,
            UUID sectionId,
            @NotBlank String studentName,
            @NotNull LocalDate dateOfBirth,
            @NotBlank String gender,
            @NotBlank String parentName,
            @NotBlank String parentMobile,
            String parentEmail,
            String address
    ) {
    }

    public record ApplicationStatusRequest(@NotBlank String status, String reviewNotes, Boolean documentsVerified) {
    }

    public record ApplicationResponse(
            UUID id, UUID branchId, String branchName, UUID academicYearId, String academicYear,
            UUID enquiryId, UUID classId, UUID sectionId, String applicationNumber,
            String studentName, LocalDate dateOfBirth, String gender,
            String parentName, String parentMobile, String parentEmail, String address,
            boolean documentsVerified, String status, String reviewNotes, UUID enrolledStudentId
    ) {
    }

    public record StudentDocumentRequest(
            @NotNull UUID fileId,
            @NotBlank String docType,
            @NotBlank String title,
            String notes
    ) {
    }

    public record StudentDocumentResponse(
            UUID id, UUID studentId, UUID fileId, String docType, String title, String notes, String originalName
    ) {
    }
}
