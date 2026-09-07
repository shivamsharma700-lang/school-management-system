package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.TeacherAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TeacherAssignmentRepository extends JpaRepository<TeacherAssignment, UUID> {

    List<TeacherAssignment> findByStaffIdAndAcademicYearId(UUID staffId, UUID academicYearId);

    List<TeacherAssignment> findByStaffId(UUID staffId);

    boolean existsByStaffIdAndSectionIdAndSubjectIdAndAcademicYearId(
            UUID staffId, UUID sectionId, UUID subjectId, UUID academicYearId);

    boolean existsByStaffIdAndSectionIdAndAcademicYearId(UUID staffId, UUID sectionId, UUID academicYearId);

    java.util.Optional<TeacherAssignment> findFirstBySectionId(UUID sectionId);
}
