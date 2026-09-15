package com.schoolgroup.sms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "campus_records")
public class CampusRecord extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private Staff staff;

    @Column(name = "module_type", nullable = false, length = 40)
    private String moduleType;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 80)
    private String category;

    @Column(nullable = false, length = 40)
    private String status = "OPEN";

    @Column(name = "scheduled_at")
    private Instant scheduledAt;

    @Column(length = 200)
    private String location;

    @Column(name = "reference_code", length = 80)
    private String referenceCode;

    @Column(length = 2000)
    private String details;

    @Column(name = "meta_json", length = 4000)
    private String metaJson;
}
