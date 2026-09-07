package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.TransportRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface TransportRouteRepository extends JpaRepository<TransportRoute, UUID>, JpaSpecificationExecutor<TransportRoute> {
}
