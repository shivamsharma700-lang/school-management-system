package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SectionRepository extends JpaRepository<Section, UUID> {

    List<Section> findBySchoolClassId(UUID classId);

    boolean existsBySchoolClassIdAndName(UUID classId, String name);
}
