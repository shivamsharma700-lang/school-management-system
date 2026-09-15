package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.SchoolEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SchoolEventRepository extends JpaRepository<SchoolEvent, UUID> {
    List<SchoolEvent> findByBranchIdOrderByStartsAtAsc(UUID branchId);

    List<SchoolEvent> findAllByOrderByStartsAtAsc();
}
