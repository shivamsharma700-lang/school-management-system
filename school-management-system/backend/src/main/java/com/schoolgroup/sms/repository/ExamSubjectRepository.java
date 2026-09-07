package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.ExamSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface ExamSubjectRepository extends JpaRepository<ExamSubject, UUID>, JpaSpecificationExecutor<ExamSubject> {

    java.util.List<ExamSubject> findByExamId(UUID examId);
}
