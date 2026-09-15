package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.TeacherTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TeacherTaskRepository extends JpaRepository<TeacherTask, UUID> {
    List<TeacherTask> findByBranchIdOrderByDueDateAscCreatedAtDesc(UUID branchId);

    List<TeacherTask> findByAssigneeIdOrderByDueDateAscCreatedAtDesc(UUID assigneeStaffId);

    List<TeacherTask> findAllByOrderByDueDateAscCreatedAtDesc();
}
