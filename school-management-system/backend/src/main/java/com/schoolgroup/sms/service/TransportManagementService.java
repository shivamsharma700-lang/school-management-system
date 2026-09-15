package com.schoolgroup.sms.service;

import com.schoolgroup.sms.entity.Branch;
import com.schoolgroup.sms.entity.Driver;
import com.schoolgroup.sms.entity.RouteStop;
import com.schoolgroup.sms.entity.Student;
import com.schoolgroup.sms.entity.StudentTransport;
import com.schoolgroup.sms.entity.TransportRoute;
import com.schoolgroup.sms.entity.Trip;
import com.schoolgroup.sms.entity.Vehicle;
import com.schoolgroup.sms.exception.ApiException;
import com.schoolgroup.sms.repository.BranchRepository;
import com.schoolgroup.sms.repository.DriverRepository;
import com.schoolgroup.sms.repository.RouteStopRepository;
import com.schoolgroup.sms.repository.StudentRepository;
import com.schoolgroup.sms.repository.StudentTransportRepository;
import com.schoolgroup.sms.repository.TransportRouteRepository;
import com.schoolgroup.sms.repository.TripRepository;
import com.schoolgroup.sms.repository.VehicleRepository;
import com.schoolgroup.sms.security.PermissionMatrix.Action;
import com.schoolgroup.sms.security.PermissionMatrix.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Fleet management: vehicles, drivers, routes, stops, trips and student
 * assignments.
 *
 * Only trip GPS pings existed before; everything else had entities but no way to
 * manage them, which left the TRANSPORT role with nothing to operate. Capability
 * is checked against the declared permission matrix and every record is scoped to
 * the caller's branch by {@link AccessService}.
 */
@Service
public class TransportManagementService {

    private final AccessService access;
    private final BranchRepository branches;
    private final VehicleRepository vehicles;
    private final DriverRepository drivers;
    private final TransportRouteRepository routes;
    private final RouteStopRepository stops;
    private final TripRepository trips;
    private final StudentTransportRepository assignments;
    private final StudentRepository students;

    public TransportManagementService(AccessService access,
                                      BranchRepository branches,
                                      VehicleRepository vehicles,
                                      DriverRepository drivers,
                                      TransportRouteRepository routes,
                                      RouteStopRepository stops,
                                      TripRepository trips,
                                      StudentTransportRepository assignments,
                                      StudentRepository students) {
        this.access = access;
        this.branches = branches;
        this.vehicles = vehicles;
        this.drivers = drivers;
        this.routes = routes;
        this.stops = stops;
        this.trips = trips;
        this.assignments = assignments;
        this.students = students;
    }

    private Branch resolveBranch(UUID requested) {
        UUID branchId = access.resolveBranch(requested);
        if (branchId == null) {
            branchId = branches.findAll().stream().findFirst()
                    .orElseThrow(() -> ApiException.badRequest("No branch available")).getId();
        }
        UUID id = branchId;
        return branches.findById(id).orElseThrow(() -> ApiException.notFound("Branch not found"));
    }

    private UUID scopeBranchId() {
        return access.requireBranch(); // null for SUPER_ADMIN = all branches
    }

    // ------------------------------------------------------------- vehicles

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listVehicles() {
        access.assertCan(Resource.TRANSPORT_FLEET, Action.VIEW);
        UUID branchId = scopeBranchId();
        return vehicles.findAll().stream()
                .filter(v -> branchId == null || (v.getBranch() != null && branchId.equals(v.getBranch().getId())))
                .sorted(Comparator.comparing(Vehicle::getRegistrationNumber, Comparator.nullsLast(String::compareTo)))
                .map(TransportManagementService::toVehicle)
                .toList();
    }

    @Transactional
    public Map<String, Object> createVehicle(UUID branchId, String registrationNumber, String vehicleType,
                                             Integer capacity, String status) {
        access.assertCan(Resource.TRANSPORT_FLEET, Action.CREATE);
        Branch branch = resolveBranch(branchId);
        vehicles.findAll().stream()
                .filter(v -> registrationNumber.equalsIgnoreCase(v.getRegistrationNumber()))
                .findAny()
                .ifPresent(v -> {
                    throw ApiException.badRequest("A vehicle with this registration already exists");
                });
        Vehicle v = new Vehicle();
        v.setBranch(branch);
        v.setRegistrationNumber(registrationNumber.trim().toUpperCase());
        v.setVehicleType(vehicleType == null ? "BUS" : vehicleType);
        v.setCapacity(capacity);
        v.setStatus(status == null ? "ACTIVE" : status);
        return toVehicle(vehicles.save(v));
    }

    @Transactional
    public Map<String, Object> updateVehicle(UUID id, String vehicleType, Integer capacity, String status) {
        access.assertCan(Resource.TRANSPORT_FLEET, Action.EDIT);
        Vehicle v = vehicles.findById(id).orElseThrow(() -> ApiException.notFound("Vehicle not found"));
        access.assertBranch(v.getBranch() == null ? null : v.getBranch().getId());
        if (vehicleType != null) v.setVehicleType(vehicleType);
        if (capacity != null) v.setCapacity(capacity);
        if (status != null) v.setStatus(status);
        return toVehicle(vehicles.save(v));
    }

    /** Soft delete: the row is retained for history, marked RETIRED. */
    @Transactional
    public void retireVehicle(UUID id) {
        access.assertCan(Resource.TRANSPORT_FLEET, Action.DELETE);
        Vehicle v = vehicles.findById(id).orElseThrow(() -> ApiException.notFound("Vehicle not found"));
        access.assertBranch(v.getBranch() == null ? null : v.getBranch().getId());
        boolean inUse = routes.findAll().stream()
                .anyMatch(r -> r.getVehicle() != null && r.getVehicle().getId().equals(id)
                        && !"RETIRED".equals(r.getStatus()));
        if (inUse) {
            throw ApiException.badRequest("Vehicle is assigned to an active route");
        }
        v.setStatus("RETIRED");
        vehicles.save(v);
    }

    private static Map<String, Object> toVehicle(Vehicle v) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", v.getId());
        row.put("registrationNumber", v.getRegistrationNumber());
        row.put("vehicleType", v.getVehicleType());
        row.put("capacity", v.getCapacity());
        row.put("status", v.getStatus());
        row.put("branchId", v.getBranch() == null ? null : v.getBranch().getId());
        return row;
    }

    // -------------------------------------------------------------- drivers

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listDrivers() {
        access.assertCan(Resource.TRANSPORT_FLEET, Action.VIEW);
        UUID branchId = scopeBranchId();
        return drivers.findAll().stream()
                .filter(d -> branchId == null || (d.getBranch() != null && branchId.equals(d.getBranch().getId())))
                .sorted(Comparator.comparing(Driver::getFullName, Comparator.nullsLast(String::compareTo)))
                .map(TransportManagementService::toDriver)
                .toList();
    }

    @Transactional
    public Map<String, Object> createDriver(UUID branchId, String fullName, String licenseNumber,
                                            String mobile, String status) {
        access.assertCan(Resource.TRANSPORT_FLEET, Action.CREATE);
        Branch branch = resolveBranch(branchId);
        Driver d = new Driver();
        d.setBranch(branch);
        d.setFullName(fullName.trim());
        d.setLicenseNumber(licenseNumber);
        d.setMobile(mobile);
        d.setStatus(status == null ? "ACTIVE" : status);
        return toDriver(drivers.save(d));
    }

    @Transactional
    public Map<String, Object> updateDriver(UUID id, String fullName, String licenseNumber,
                                            String mobile, String status) {
        access.assertCan(Resource.TRANSPORT_FLEET, Action.EDIT);
        Driver d = drivers.findById(id).orElseThrow(() -> ApiException.notFound("Driver not found"));
        access.assertBranch(d.getBranch() == null ? null : d.getBranch().getId());
        if (fullName != null) d.setFullName(fullName);
        if (licenseNumber != null) d.setLicenseNumber(licenseNumber);
        if (mobile != null) d.setMobile(mobile);
        if (status != null) d.setStatus(status);
        return toDriver(drivers.save(d));
    }

    private static Map<String, Object> toDriver(Driver d) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", d.getId());
        row.put("fullName", d.getFullName());
        row.put("licenseNumber", d.getLicenseNumber());
        row.put("mobile", d.getMobile());
        row.put("status", d.getStatus());
        row.put("branchId", d.getBranch() == null ? null : d.getBranch().getId());
        return row;
    }

    // --------------------------------------------------------------- routes

    @Transactional
    public Map<String, Object> createRoute(UUID branchId, String name, UUID vehicleId, UUID driverId) {
        access.assertCan(Resource.TRANSPORT_FLEET, Action.CREATE);
        Branch branch = resolveBranch(branchId);
        TransportRoute r = new TransportRoute();
        r.setBranch(branch);
        r.setName(name.trim());
        applyVehicleAndDriver(r, vehicleId, driverId);
        r.setStatus("ACTIVE");
        return toRoute(routes.save(r));
    }

    @Transactional
    public Map<String, Object> updateRoute(UUID id, String name, UUID vehicleId, UUID driverId, String status) {
        access.assertCan(Resource.TRANSPORT_FLEET, Action.EDIT);
        TransportRoute r = routes.findById(id).orElseThrow(() -> ApiException.notFound("Route not found"));
        access.assertBranch(r.getBranch() == null ? null : r.getBranch().getId());
        if (name != null) r.setName(name);
        applyVehicleAndDriver(r, vehicleId, driverId);
        if (status != null) r.setStatus(status);
        return toRoute(routes.save(r));
    }

    private void applyVehicleAndDriver(TransportRoute r, UUID vehicleId, UUID driverId) {
        if (vehicleId != null) {
            Vehicle v = vehicles.findById(vehicleId).orElseThrow(() -> ApiException.notFound("Vehicle not found"));
            access.assertBranch(v.getBranch() == null ? null : v.getBranch().getId());
            r.setVehicle(v);
        }
        if (driverId != null) {
            Driver d = drivers.findById(driverId).orElseThrow(() -> ApiException.notFound("Driver not found"));
            access.assertBranch(d.getBranch() == null ? null : d.getBranch().getId());
            r.setDriver(d);
        }
    }

    private static Map<String, Object> toRoute(TransportRoute r) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", r.getId());
        row.put("name", r.getName());
        row.put("status", r.getStatus());
        row.put("vehicleId", r.getVehicle() == null ? null : r.getVehicle().getId());
        row.put("vehicleNumber", r.getVehicle() == null ? null : r.getVehicle().getRegistrationNumber());
        row.put("driverId", r.getDriver() == null ? null : r.getDriver().getId());
        row.put("driverName", r.getDriver() == null ? null : r.getDriver().getFullName());
        row.put("branchId", r.getBranch() == null ? null : r.getBranch().getId());
        return row;
    }

    // ---------------------------------------------------------------- stops

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listStops(UUID routeId) {
        access.assertCan(Resource.TRANSPORT_FLEET, Action.VIEW);
        TransportRoute route = requireRoute(routeId);
        return stops.findAll().stream()
                .filter(s -> s.getRoute() != null && s.getRoute().getId().equals(route.getId()))
                .sorted(Comparator.comparing(RouteStop::getSequenceNo, Comparator.nullsLast(Integer::compareTo)))
                .map(s -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", s.getId());
                    row.put("name", s.getName());
                    row.put("sequenceNo", s.getSequenceNo());
                    row.put("arrivalTime", s.getArrivalTime() == null ? null : s.getArrivalTime().toString());
                    row.put("routeId", route.getId());
                    return row;
                })
                .toList();
    }

    @Transactional
    public Map<String, Object> addStop(UUID routeId, String name, Integer sequenceNo, String arrivalTime) {
        access.assertCan(Resource.TRANSPORT_FLEET, Action.CREATE);
        TransportRoute route = requireRoute(routeId);
        RouteStop s = new RouteStop();
        s.setRoute(route);
        s.setName(name.trim());
        s.setSequenceNo(sequenceNo);
        if (arrivalTime != null && !arrivalTime.isBlank()) {
            s.setArrivalTime(LocalTime.parse(arrivalTime));
        }
        stops.save(s);
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", s.getId());
        row.put("name", s.getName());
        row.put("sequenceNo", s.getSequenceNo());
        row.put("routeId", route.getId());
        return row;
    }

    private TransportRoute requireRoute(UUID routeId) {
        TransportRoute route = routes.findById(routeId)
                .orElseThrow(() -> ApiException.notFound("Route not found"));
        access.assertBranch(route.getBranch() == null ? null : route.getBranch().getId());
        return route;
    }

    // ----------------------------------------------------------------- trips

    @Transactional
    public Map<String, Object> createTrip(UUID routeId, LocalDate tripDate, String tripType) {
        access.assertCan(Resource.TRANSPORT_TRACKING, Action.CREATE);
        TransportRoute route = requireRoute(routeId);
        Trip t = new Trip();
        t.setRoute(route);
        t.setTripDate(tripDate == null ? LocalDate.now() : tripDate);
        t.setTripType(tripType == null ? "PICKUP" : tripType);
        t.setStatus("SCHEDULED");
        trips.save(t);
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", t.getId());
        row.put("routeId", route.getId());
        row.put("tripDate", t.getTripDate().toString());
        row.put("tripType", t.getTripType());
        row.put("status", t.getStatus());
        return row;
    }

    @Transactional
    public Map<String, Object> updateTripStatus(UUID tripId, String status) {
        access.assertCan(Resource.TRANSPORT_TRACKING, Action.EDIT);
        Trip t = trips.findById(tripId).orElseThrow(() -> ApiException.notFound("Trip not found"));
        access.assertBranch(t.getRoute() == null || t.getRoute().getBranch() == null
                ? null : t.getRoute().getBranch().getId());
        if (status != null) {
            t.setStatus(status);
        }
        trips.save(t);
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", t.getId());
        row.put("status", t.getStatus());
        return row;
    }

    // ------------------------------------------------------ student assignment

    @Transactional
    public Map<String, Object> assignStudent(UUID studentId, UUID routeId, UUID stopId) {
        access.assertCan(Resource.TRANSPORT_FLEET, Action.EDIT);
        TransportRoute route = requireRoute(routeId);
        Student student = students.findById(studentId)
                .orElseThrow(() -> ApiException.notFound("Student not found"));
        access.assertBranch(student.getBranch() == null ? null : student.getBranch().getId());

        StudentTransport st = new StudentTransport();
        st.setStudent(student);
        st.setRoute(route);
        if (stopId != null) {
            RouteStop stop = stops.findById(stopId)
                    .orElseThrow(() -> ApiException.notFound("Stop not found"));
            if (stop.getRoute() == null || !stop.getRoute().getId().equals(route.getId())) {
                throw ApiException.badRequest("Stop does not belong to this route");
            }
            st.setStop(stop);
        }
        st.setStatus("ACTIVE");
        assignments.save(st);

        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", st.getId());
        row.put("studentId", student.getId());
        row.put("routeId", route.getId());
        row.put("stopId", stopId);
        row.put("status", st.getStatus());
        return row;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> routeRoster(UUID routeId) {
        access.assertCan(Resource.TRANSPORT_FLEET, Action.VIEW);
        TransportRoute route = requireRoute(routeId);
        return assignments.findAll().stream()
                .filter(a -> a.getRoute() != null && a.getRoute().getId().equals(route.getId()))
                .filter(a -> !"INACTIVE".equals(a.getStatus()))
                .map(a -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", a.getId());
                    row.put("studentId", a.getStudent() == null ? null : a.getStudent().getId());
                    row.put("studentName", a.getStudent() == null ? null : a.getStudent().getFullName());
                    row.put("admissionNumber", a.getStudent() == null ? null : a.getStudent().getAdmissionNumber());
                    row.put("stopName", a.getStop() == null ? null : a.getStop().getName());
                    row.put("status", a.getStatus());
                    return row;
                })
                .toList();
    }
}
