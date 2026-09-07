package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.TimetableSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public interface TimetableSlotRepository extends JpaRepository<TimetableSlot, UUID> {

    List<TimetableSlot> findBySectionIdAndAcademicYearId(UUID sectionId, UUID academicYearId);

    List<TimetableSlot> findByStaffIdAndAcademicYearId(UUID staffId, UUID academicYearId);

    boolean existsBySectionIdAndAcademicYearIdAndDayOfWeekAndStartTime(
            UUID sectionId, UUID academicYearId, Integer dayOfWeek, LocalTime startTime);

    boolean existsByStaffIdAndAcademicYearIdAndDayOfWeekAndStartTime(
            UUID staffId, UUID academicYearId, Integer dayOfWeek, LocalTime startTime);
}
