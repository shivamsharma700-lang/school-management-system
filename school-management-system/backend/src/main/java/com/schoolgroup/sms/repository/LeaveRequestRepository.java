package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {

    List<LeaveRequest> findByRequesterIdOrderByCreatedAtDesc(UUID requesterId);

    List<LeaveRequest> findByStudentId(UUID studentId);

    List<LeaveRequest> findByStaffId(UUID staffId);

    @Query("""
            select count(l) from LeaveRequest l
            where l.requester.id = :requesterId
              and l.status in ('PENDING', 'APPROVED')
              and l.startDate <= :endDate
              and l.endDate >= :startDate
            """)
    long countOverlapping(UUID requesterId, LocalDate startDate, LocalDate endDate);
}
