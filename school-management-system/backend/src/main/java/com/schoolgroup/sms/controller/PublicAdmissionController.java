package com.schoolgroup.sms.controller;

import com.schoolgroup.sms.dto.AdmissionDtos;
import com.schoolgroup.sms.service.AdmissionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
public class PublicAdmissionController {

    private final AdmissionService admissions;

    public PublicAdmissionController(AdmissionService admissions) {
        this.admissions = admissions;
    }

    @PostMapping("/admissions/enquiries")
    public AdmissionDtos.EnquiryResponse createEnquiry(@Valid @RequestBody AdmissionDtos.EnquiryRequest request) {
        return admissions.toEnquiry(admissions.createPublicEnquiry(request));
    }
}
