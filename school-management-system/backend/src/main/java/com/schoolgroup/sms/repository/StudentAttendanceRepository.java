package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.StudentAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface StudentAttendanceRepository extends JpaRepository<StudentAttendance, UUID> {

    boolean existsByStudentIdAndAttendanceDateAndSession(UUID studentId, LocalDate date, String session);

    List<StudentAttendance> findByStudentIdAndAttendanceDateBetween(UUID studentId, LocalDate from, LocalDate to);

    List<StudentAttendance> findBySectionIdAndAttendanceDateAndSession(UUID sectionId, LocalDate date, String session);

    @Query("select count(a) from StudentAttendance a where a.student.id = :studentId and a.status = 'PRESENT'")
    long countPresent(UUID studentId);

    long countByStudentId(UUID studentId);

    List<StudentAttendance> findByStudentIdOrderByAttendanceDateDesc(UUID studentId);

    @Query("select max(a.attendanceDate) from StudentAttendance a")
    java.util.Optional<LocalDate> findLatestDate();

    @Query("select max(a.attendanceDate) from StudentAttendance a where a.branch.id = :branchId")
    java.util.Optional<LocalDate> findLatestDateByBranchId(UUID branchId);

    long countByAttendanceDate(LocalDate date);

    long countByAttendanceDateAndBranchId(LocalDate date, UUID branchId);

    long countByAttendanceDateAndStatusIn(LocalDate date, java.util.Collection<String> statuses);

    long countByAttendanceDateAndBranchIdAndStatusIn(LocalDate date, UUID branchId, java.util.Collection<String> statuses);

    @Query("select a.status, count(a) from StudentAttendance a where a.attendanceDate = :date group by a.status")
    List<Object[]> countByStatusOnDate(LocalDate date);
}
