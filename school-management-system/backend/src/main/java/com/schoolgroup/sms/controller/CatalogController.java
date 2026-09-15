package com.schoolgroup.sms.controller;

import com.schoolgroup.sms.dto.SchoolDtos;
import com.schoolgroup.sms.service.CatalogService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class CatalogController {

    private final CatalogService catalog;

    public CatalogController(CatalogService catalog) {
        this.catalog = catalog;
    }

    @GetMapping("/branches")
    public List<SchoolDtos.BranchResponse> branches() {
        return catalog.listBranches().stream().map(CatalogService::toBranch).toList();
    }

    @PostMapping("/branches")
    public SchoolDtos.BranchResponse createBranch(@Valid @RequestBody SchoolDtos.BranchRequest request) {
        return CatalogService.toBranch(catalog.createBranch(request));
    }

    @PutMapping("/branches/{id}")
    public SchoolDtos.BranchResponse updateBranch(@PathVariable UUID id, @Valid @RequestBody SchoolDtos.BranchRequest request) {
        return CatalogService.toBranch(catalog.updateBranch(id, request));
    }

    @GetMapping("/academic-years")
    public List<SchoolDtos.AcademicYearResponse> years() {
        return catalog.listYears().stream().map(CatalogService::toYear).toList();
    }

    @PostMapping("/academic-years")
    public SchoolDtos.AcademicYearResponse createYear(@Valid @RequestBody SchoolDtos.AcademicYearRequest request) {
        return CatalogService.toYear(catalog.createYear(request));
    }

    @PutMapping("/academic-years/{id}")
    public SchoolDtos.AcademicYearResponse updateYear(@PathVariable UUID id,
                                                      @Valid @RequestBody SchoolDtos.AcademicYearRequest request) {
        return CatalogService.toYear(catalog.updateYear(id, request));
    }

    @GetMapping("/classes")
    public List<SchoolDtos.ClassResponse> classes(@RequestParam(required = false) UUID branchId) {
        return catalog.listClasses(branchId).stream().map(CatalogService::toClass).toList();
    }

    @PostMapping("/classes")
    public SchoolDtos.ClassResponse createClass(@Valid @RequestBody SchoolDtos.ClassRequest request) {
        return CatalogService.toClass(catalog.createClass(request));
    }

    @PutMapping("/classes/{classId}")
    public SchoolDtos.ClassResponse updateClass(@PathVariable UUID classId,
                                                @Valid @RequestBody SchoolDtos.ClassRequest request) {
        return CatalogService.toClass(catalog.updateClass(classId, request));
    }

    @GetMapping("/classes/{classId}")
    public SchoolDtos.ClassResponse getClass(@PathVariable UUID classId) {
        return CatalogService.toClass(catalog.getClass(classId));
    }

    @GetMapping("/classes/{classId}/sections")
    public List<SchoolDtos.SectionResponse> sections(@PathVariable UUID classId) {
        return catalog.listSections(classId).stream().map(CatalogService::toSection).toList();
    }

    @GetMapping("/classes/{classId}/sections/{sectionId}")
    public SchoolDtos.SectionDetailResponse section(@PathVariable UUID classId, @PathVariable UUID sectionId) {
        return catalog.getSection(classId, sectionId);
    }

    @PostMapping("/classes/{classId}/sections")
    public SchoolDtos.SectionResponse createSection(@PathVariable UUID classId,
                                                    @Valid @RequestBody SchoolDtos.SectionRequest request) {
        return CatalogService.toSection(catalog.createSection(classId, request));
    }

    @PutMapping("/classes/{classId}/sections/{sectionId}")
    public SchoolDtos.SectionResponse updateSection(@PathVariable UUID classId,
                                                    @PathVariable UUID sectionId,
                                                    @Valid @RequestBody SchoolDtos.SectionRequest request) {
        return CatalogService.toSection(catalog.updateSection(classId, sectionId, request));
    }

    @GetMapping("/subjects")
    public List<SchoolDtos.SubjectResponse> subjects(@RequestParam(required = false) UUID branchId) {
        return catalog.listSubjects(branchId).stream().map(CatalogService::toSubject).toList();
    }

    @PostMapping("/subjects")
    public SchoolDtos.SubjectResponse createSubject(@Valid @RequestBody SchoolDtos.SubjectRequest request) {
        return CatalogService.toSubject(catalog.createSubject(request));
    }

    @PutMapping("/subjects/{id}")
    public SchoolDtos.SubjectResponse updateSubject(@PathVariable UUID id,
                                                    @Valid @RequestBody SchoolDtos.SubjectRequest request) {
        return CatalogService.toSubject(catalog.updateSubject(id, request));
    }
}
