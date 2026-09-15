package com.schoolgroup.sms.controller;

import com.schoolgroup.sms.service.TransportManagementService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Fleet management API for the TRANSPORT role (and admins).
 * Authorisation and branch scoping are enforced in the service layer.
 */
@RestController
@RequestMapping("/api/transport")
public class TransportManagementController {

    private final TransportManagementService transport;

    public TransportManagementController(TransportManagementService transport) {
        this.transport = transport;
    }

    public record VehicleRequest(UUID branchId, @NotBlank String registrationNumber, String vehicleType,
                                 Integer capacity, String status) {
    }

    public record VehicleUpdate(String vehicleType, Integer capacity, String status) {
    }

    public record DriverRequest(UUID branchId, @NotBlank String fullName, String licenseNumber,
                                String mobile, String status) {
    }

    public record RouteRequest(UUID branchId, @NotBlank String name, UUID vehicleId, UUID driverId) {
    }

    public record RouteUpdate(String name, UUID vehicleId, UUID driverId, String status) {
    }

    public record StopRequest(@NotBlank String name, Integer sequenceNo, String arrivalTime) {
    }

    public record TripRequest(UUID routeId, LocalDate tripDate, String tripType) {
    }

    public record TripStatusRequest(@NotBlank String status) {
    }

    public record AssignmentRequest(UUID studentId, UUID routeId, UUID stopId) {
    }

    // vehicles
    @GetMapping("/vehicles")
    public List<Map<String, Object>> vehicles() {
        return transport.listVehicles();
    }

    @PostMapping("/vehicles")
    public Map<String, Object> createVehicle(@Valid @RequestBody VehicleRequest request) {
        return transport.createVehicle(request.branchId(), request.registrationNumber(),
                request.vehicleType(), request.capacity(), request.status());
    }

    @PutMapping("/vehicles/{id}")
    public Map<String, Object> updateVehicle(@PathVariable UUID id, @RequestBody VehicleUpdate request) {
        return transport.updateVehicle(id, request.vehicleType(), request.capacity(), request.status());
    }

    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<Void> retireVehicle(@PathVariable UUID id) {
        transport.retireVehicle(id);
        return ResponseEntity.noContent().build();
    }

    // drivers
    @GetMapping("/drivers")
    public List<Map<String, Object>> drivers() {
        return transport.listDrivers();
    }

    @PostMapping("/drivers")
    public Map<String, Object> createDriver(@Valid @RequestBody DriverRequest request) {
        return transport.createDriver(request.branchId(), request.fullName(),
                request.licenseNumber(), request.mobile(), request.status());
    }

    @PutMapping("/drivers/{id}")
    public Map<String, Object> updateDriver(@PathVariable UUID id, @RequestBody DriverRequest request) {
        return transport.updateDriver(id, request.fullName(), request.licenseNumber(),
                request.mobile(), request.status());
    }

    // routes
    @PostMapping("/routes")
    public Map<String, Object> createRoute(@Valid @RequestBody RouteRequest request) {
        return transport.createRoute(request.branchId(), request.name(), request.vehicleId(), request.driverId());
    }

    @PutMapping("/routes/{id}")
    public Map<String, Object> updateRoute(@PathVariable UUID id, @RequestBody RouteUpdate request) {
        return transport.updateRoute(id, request.name(), request.vehicleId(),
                request.driverId(), request.status());
    }

    // stops
    @GetMapping("/routes/{routeId}/stops")
    public List<Map<String, Object>> stops(@PathVariable UUID routeId) {
        return transport.listStops(routeId);
    }

    @PostMapping("/routes/{routeId}/stops")
    public Map<String, Object> addStop(@PathVariable UUID routeId, @Valid @RequestBody StopRequest request) {
        return transport.addStop(routeId, request.name(), request.sequenceNo(), request.arrivalTime());
    }

    // roster
    @GetMapping("/routes/{routeId}/students")
    public List<Map<String, Object>> roster(@PathVariable UUID routeId) {
        return transport.routeRoster(routeId);
    }

    @PostMapping("/assignments")
    public Map<String, Object> assign(@RequestBody AssignmentRequest request) {
        return transport.assignStudent(request.studentId(), request.routeId(), request.stopId());
    }

    // trips
    @PostMapping("/trips")
    public Map<String, Object> createTrip(@RequestBody TripRequest request) {
        return transport.createTrip(request.routeId(), request.tripDate(), request.tripType());
    }

    @PutMapping("/trips/{id}/status")
    public Map<String, Object> updateTripStatus(@PathVariable UUID id,
                                                @Valid @RequestBody TripStatusRequest request) {
        return transport.updateTripStatus(id, request.status());
    }
}
