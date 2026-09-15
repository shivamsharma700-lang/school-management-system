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
@Table(name = "inventory_items")
public class InventoryItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(nullable = false, length = 80)
    private String category;

    @Column(name = "item_name", nullable = false, length = 200)
    private String itemName;

    @Column(length = 80)
    private String sku;

    @Column(length = 200)
    private String location;

    @Column(nullable = false)
    private Integer quantity = 0;

    @Column(nullable = false, length = 40)
    private String unit = "PCS";

    @Column(nullable = false, length = 30)
    private String status = "IN_STOCK";

    @Column(length = 1000)
    private String notes;
}
