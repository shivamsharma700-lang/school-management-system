-- Phase 2: dedicated TRANSPORT role + fleet compliance records.
--
-- The product requires a transport operator who manages vehicles, drivers,
-- routes, stops, trips and student assignments without touching academic or
-- financial data. Previously no such role existed, so fleet work had to be done
-- by a branch admin.

ALTER TABLE users DROP CONSTRAINT IF EXISTS ck_users_role;
ALTER TABLE users ADD CONSTRAINT ck_users_role CHECK (role IN (
    'SUPER_ADMIN', 'BRANCH_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTANT', 'PARENT', 'STUDENT', 'TRANSPORT'
));

-- Statutory documents a school vehicle must carry in India: fitness certificate,
-- insurance, pollution-under-control (PUC) and the route permit. Expiry dates
-- drive the compliance alerts on the transport dashboard.
CREATE TABLE vehicle_documents (
    id UUID PRIMARY KEY,
    vehicle_id UUID NOT NULL,
    doc_type VARCHAR(30) NOT NULL,
    document_number VARCHAR(80),
    issued_on DATE,
    expires_on DATE NOT NULL,
    issuer VARCHAR(150),
    file_path VARCHAR(400),
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_vehicle_documents_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE,
    CONSTRAINT ck_vehicle_documents_type CHECK (doc_type IN (
        'FITNESS', 'INSURANCE', 'POLLUTION', 'PERMIT', 'REGISTRATION', 'TAX'
    ))
);

CREATE INDEX idx_vehicle_documents_vehicle ON vehicle_documents (vehicle_id);
CREATE INDEX idx_vehicle_documents_expiry ON vehicle_documents (expires_on);

CREATE TABLE vehicle_maintenance (
    id UUID PRIMARY KEY,
    vehicle_id UUID NOT NULL,
    service_type VARCHAR(40) NOT NULL,
    performed_on DATE NOT NULL,
    next_due_on DATE,
    odometer_km INTEGER,
    cost_amount NUMERIC(12, 2),
    vendor VARCHAR(150),
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_vehicle_maintenance_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE,
    CONSTRAINT ck_vehicle_maintenance_type CHECK (service_type IN (
        'ROUTINE', 'REPAIR', 'TYRE', 'BRAKE', 'ENGINE', 'BODY', 'INSPECTION', 'OTHER'
    ))
);

CREATE INDEX idx_vehicle_maintenance_vehicle ON vehicle_maintenance (vehicle_id);

-- Per-student boarding / drop events for a trip, so parents see actual status
-- rather than an assumed one.
CREATE TABLE trip_boardings (
    id UUID PRIMARY KEY,
    trip_id UUID NOT NULL,
    student_id UUID NOT NULL,
    stop_id UUID,
    event_type VARCHAR(20) NOT NULL,
    event_at TIMESTAMP NOT NULL,
    recorded_by UUID,
    notes VARCHAR(300),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_trip_boardings_trip FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE,
    CONSTRAINT fk_trip_boardings_student FOREIGN KEY (student_id) REFERENCES students (id),
    CONSTRAINT fk_trip_boardings_stop FOREIGN KEY (stop_id) REFERENCES route_stops (id),
    CONSTRAINT fk_trip_boardings_user FOREIGN KEY (recorded_by) REFERENCES users (id),
    CONSTRAINT ck_trip_boardings_event CHECK (event_type IN ('BOARDED', 'DROPPED', 'ABSENT'))
);

CREATE INDEX idx_trip_boardings_trip ON trip_boardings (trip_id);
CREATE INDEX idx_trip_boardings_student ON trip_boardings (student_id);
