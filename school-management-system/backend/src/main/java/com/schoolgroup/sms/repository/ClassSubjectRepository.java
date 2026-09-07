package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.ClassSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface ClassSubjectRepository extends JpaRepository<ClassSubject, UUID>, JpaSpecificationExecutor<ClassSubject> {
}
