package com.schoolgroup.sms.controller;

import com.schoolgroup.sms.service.TeacherTaskService;
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
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/teacher-tasks")
public class TeacherTaskController {

    private final TeacherTaskService tasks;

    public TeacherTaskController(TeacherTaskService tasks) {
        this.tasks = tasks;
    }

    @GetMapping
    public List<Map<String, Object>> list(@RequestParam(required = false) String status,
                                          @RequestParam(required = false) String priority) {
        return tasks.list(status, priority);
    }

    @GetMapping("/summary")
    public Map<String, Object> summary() {
        return tasks.summary();
    }

    @PostMapping
    public Map<String, Object> create(@Valid @RequestBody TeacherTaskService.CreateRequest request) {
        return tasks.create(request);
    }

    @PutMapping("/{id}/status")
    public Map<String, Object> updateStatus(@PathVariable UUID id,
                                            @Valid @RequestBody TeacherTaskService.StatusRequest request) {
        return tasks.updateStatus(id, request);
    }
}
