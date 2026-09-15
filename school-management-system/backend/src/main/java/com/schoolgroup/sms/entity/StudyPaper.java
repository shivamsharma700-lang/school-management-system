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
@Table(name = "study_papers")
public class StudyPaper extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "subject_name", length = 120)
    private String subjectName;

    @Column(name = "class_name", length = 80)
    private String className;

    @Column(name = "paper_type", nullable = false, length = 40)
    private String paperType = "WORKSHEET";

    @Column(name = "file_id")
    private java.util.UUID fileId;

    @Column(nullable = false, length = 30)
    private String status = "DRAFT";

    @Column(length = 1000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private UserAccount createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_user_id")
    private UserAccount reviewedBy;

    @Column(name = "review_notes", length = 1000)
    private String reviewNotes;

    @Column(name = "section_name", length = 80)
    private String sectionName;

    @Column(name = "exam_name", length = 120)
    private String examName;
}
