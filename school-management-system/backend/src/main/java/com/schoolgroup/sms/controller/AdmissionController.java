package com.schoolgroup.sms.controller;

import com.schoolgroup.sms.dto.AdmissionDtos;
import com.schoolgroup.sms.dto.PageResponse;
import com.schoolgroup.sms.service.AdmissionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class AdmissionController {

    private final AdmissionService admissions;

    public AdmissionController(AdmissionService admissions) {
        this.admissions = admissions;
    }

    @GetMapping("/admissions/enquiries")
    public PageResponse<AdmissionDtos.EnquiryResponse> enquiries(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<com.schoolgroup.sms.entity.AdmissionEnquiry> result = admissions.listEnquiries(q, status, page, size);
        return new PageResponse<>(result.getContent().stream().map(admissions::toEnquiry).toList(),
                result.getTotalElements(), result.getNumber(), result.getSize());
    }

    @PostMapping("/admissions/enquiries")
    public AdmissionDtos.EnquiryResponse createEnquiry(@Valid @RequestBody AdmissionDtos.EnquiryRequest request) {
        return admissions.toEnquiry(admissions.createEnquiry(request));
    }

    @PutMapping("/admissions/enquiries/{id}/status")
    public AdmissionDtos.EnquiryResponse enquiryStatus(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("status", "NEW");
        return admissions.toEnquiry(admissions.updateEnquiryStatus(id, status));
    }

    @GetMapping("/admissions/applications")
    public PageResponse<AdmissionDtos.ApplicationResponse> applications(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var result = admissions.listApplications(q, status, page, size);
        return new PageResponse<>(result.getContent().stream().map(admissions::toApplication).toList(),
                result.getTotalElements(), result.getNumber(), result.getSize());
    }

    @PostMapping("/admissions/applications")
    public AdmissionDtos.ApplicationResponse createApplication(@Valid @RequestBody AdmissionDtos.ApplicationRequest request) {
        return admissions.toApplication(admissions.createApplication(request));
    }

    @PutMapping("/admissions/applications/{id}")
    public AdmissionDtos.ApplicationResponse updateApplication(@PathVariable UUID id,
                                                               @Valid @RequestBody AdmissionDtos.ApplicationStatusRequest request) {
        return admissions.toApplication(admissions.updateApplication(id, request));
    }

    @GetMapping("/students/{id}/documents")
    public List<AdmissionDtos.StudentDocumentResponse> documents(@PathVariable UUID id) {
        return admissions.listDocuments(id).stream().map(admissions::toDocument).toList();
    }

    @PostMapping("/students/{id}/documents")
    public AdmissionDtos.StudentDocumentResponse addDocument(@PathVariable UUID id,
                                                            @Valid @RequestBody AdmissionDtos.StudentDocumentRequest request) {
        return admissions.toDocument(admissions.addDocument(id, request));
    }
}
