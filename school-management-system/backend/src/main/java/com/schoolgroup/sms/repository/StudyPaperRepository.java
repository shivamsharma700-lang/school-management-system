package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.StudyPaper;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StudyPaperRepository extends JpaRepository<StudyPaper, UUID> {
    List<StudyPaper> findByBranchIdOrderByCreatedAtDesc(UUID branchId);

    List<StudyPaper> findAllByOrderByCreatedAtDesc();
}
