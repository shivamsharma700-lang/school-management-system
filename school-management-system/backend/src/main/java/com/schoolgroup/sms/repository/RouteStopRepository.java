package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.RouteStop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface RouteStopRepository extends JpaRepository<RouteStop, UUID>, JpaSpecificationExecutor<RouteStop> {
}
