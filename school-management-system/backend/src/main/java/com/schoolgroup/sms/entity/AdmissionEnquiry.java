package com.schoolgroup.sms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "admission_enquiries")
public class AdmissionEnquiry extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interested_class_id")
    private SchoolClass interestedClass;

    @Column(name = "student_name", nullable = false, length = 150)
    private String studentName;

    @Column(name = "parent_name", length = 150)
    private String parentName;

    @Column(nullable = false, length = 30)
    private String mobile;

    @Column(length = 150)
    private String email;

    @Column(length = 80)
    private String source;

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false, length = 30)
    private String status = "NEW";
}
