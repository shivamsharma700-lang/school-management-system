package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.TripLocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TripLocationRepository extends JpaRepository<TripLocation, UUID> {
    List<TripLocation> findByTripIdOrderByRecordedAtDesc(UUID tripId);

    Optional<TripLocation> findFirstByTripIdOrderByRecordedAtDesc(UUID tripId);
}
