package com.schoolgroup.sms.controller;

import com.schoolgroup.sms.dto.PageResponse;
import com.schoolgroup.sms.dto.SchoolDtos;
import com.schoolgroup.sms.service.ProfileWorkspaceService;
import com.schoolgroup.sms.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService students;
    private final ProfileWorkspaceService workspace;

    public StudentController(StudentService students, ProfileWorkspaceService workspace) {
        this.students = students;
        this.workspace = workspace;
    }

    @GetMapping
    public PageResponse<SchoolDtos.StudentResponse> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) UUID branchId,
            @RequestParam(required = false) UUID classId,
            @RequestParam(required = false) UUID sectionId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) UUID academicYearId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return students.search(q, branchId, classId, sectionId, status, gender, academicYearId, page, size);
    }

    @GetMapping("/summary")
    public SchoolDtos.StudentSummary summary(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) UUID branchId,
            @RequestParam(required = false) UUID classId,
            @RequestParam(required = false) UUID sectionId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) UUID academicYearId) {
        return students.summary(q, branchId, classId, sectionId, status, gender, academicYearId);
    }

    @GetMapping("/{id}")
    public SchoolDtos.StudentResponse get(@PathVariable UUID id) {
        return students.get(id);
    }

    @GetMapping("/{id}/workspace")
    public Map<String, Object> workspace(@PathVariable UUID id) {
        return workspace.studentWorkspace(id);
    }

    @PostMapping
    public SchoolDtos.StudentResponse create(@Valid @RequestBody SchoolDtos.StudentRequest request) {
        return students.create(request);
    }

    @PutMapping("/{id}")
    public SchoolDtos.StudentResponse update(@PathVariable UUID id, @Valid @RequestBody SchoolDtos.StudentRequest request) {
        return students.update(id, request);
    }
}
