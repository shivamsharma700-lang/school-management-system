package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.TeacherSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface TeacherSubjectRepository extends JpaRepository<TeacherSubject, UUID>, JpaSpecificationExecutor<TeacherSubject> {
}
