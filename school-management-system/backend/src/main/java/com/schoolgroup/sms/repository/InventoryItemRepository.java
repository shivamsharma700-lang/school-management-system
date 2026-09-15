package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, UUID> {
    List<InventoryItem> findByBranchIdOrderByItemNameAsc(UUID branchId);

    List<InventoryItem> findAllByOrderByItemNameAsc();
}
