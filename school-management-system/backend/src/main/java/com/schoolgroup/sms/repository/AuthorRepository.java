package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.Author;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface AuthorRepository extends JpaRepository<Author, UUID>, JpaSpecificationExecutor<Author> {

    java.util.Optional<Author> findByName(String name);
}
