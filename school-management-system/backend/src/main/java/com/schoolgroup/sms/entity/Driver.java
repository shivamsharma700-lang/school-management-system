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
@Table(name = "drivers")
public class Driver extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "license_number", nullable = false, unique = true, length = 40)
    private String licenseNumber;

    @Column(nullable = false, length = 30)
    private String mobile;

    @Column(nullable = false, length = 20)
    private String status;
}
