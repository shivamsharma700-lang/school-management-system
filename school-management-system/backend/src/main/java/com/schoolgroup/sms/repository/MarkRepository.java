package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.Mark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MarkRepository extends JpaRepository<Mark, UUID> {

    boolean existsByExamSubjectIdAndStudentId(UUID examSubjectId, UUID studentId);

    Optional<Mark> findByExamSubjectIdAndStudentId(UUID examSubjectId, UUID studentId);

    List<Mark> findByExamSubjectId(UUID examSubjectId);

    List<Mark> findByStudentId(UUID studentId);
}
