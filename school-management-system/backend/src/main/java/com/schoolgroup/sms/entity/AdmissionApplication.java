package com.schoolgroup.sms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "admission_applications")
public class AdmissionApplication extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enquiry_id")
    private AdmissionEnquiry enquiry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id")
    private SchoolClass schoolClass;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    private Section section;

    @Column(name = "application_number", nullable = false, length = 40)
    private String applicationNumber;

    @Column(name = "student_name", nullable = false, length = 150)
    private String studentName;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(nullable = false, length = 20)
    private String gender;

    @Column(name = "parent_name", nullable = false, length = 150)
    private String parentName;

    @Column(name = "parent_mobile", nullable = false, length = 30)
    private String parentMobile;

    @Column(name = "parent_email", length = 150)
    private String parentEmail;

    @Column(length = 500)
    private String address;

    @Column(name = "documents_verified", nullable = false)
    private boolean documentsVerified;

    @Column(nullable = false, length = 30)
    private String status = "SUBMITTED";

    @Column(name = "review_notes", length = 1000)
    private String reviewNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrolled_student_id")
    private Student enrolledStudent;
}
