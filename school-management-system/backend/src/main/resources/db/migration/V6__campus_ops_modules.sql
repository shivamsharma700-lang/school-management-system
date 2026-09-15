-- Remaining ERP modules (H2-compatible TIMESTAMP)

CREATE TABLE campus_records (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    branch_id UUID NOT NULL REFERENCES branches(id),
    student_id UUID REFERENCES students(id),
    staff_id UUID REFERENCES staff(id),
    module_type VARCHAR(40) NOT NULL,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(80),
    status VARCHAR(40) NOT NULL DEFAULT 'OPEN',
    scheduled_at TIMESTAMP,
    location VARCHAR(200),
    reference_code VARCHAR(80),
    details VARCHAR(2000),
    meta_json VARCHAR(4000)
);

CREATE INDEX idx_campus_records_type ON campus_records(module_type);
CREATE INDEX idx_campus_records_branch ON campus_records(branch_id);
CREATE INDEX idx_campus_records_student ON campus_records(student_id);

CREATE TABLE payroll_entries (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    branch_id UUID NOT NULL REFERENCES branches(id),
    staff_id UUID NOT NULL REFERENCES staff(id),
    pay_month VARCHAR(7) NOT NULL,
    gross_amount DECIMAL(12,2) NOT NULL,
    net_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    notes VARCHAR(1000)
);

CREATE INDEX idx_payroll_branch ON payroll_entries(branch_id);
CREATE INDEX idx_payroll_month ON payroll_entries(pay_month);

CREATE TABLE study_papers (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    branch_id UUID NOT NULL REFERENCES branches(id),
    title VARCHAR(200) NOT NULL,
    subject_name VARCHAR(120),
    class_name VARCHAR(80),
    paper_type VARCHAR(40) NOT NULL DEFAULT 'WORKSHEET',
    file_id UUID,
    status VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED',
    description VARCHAR(1000)
);

CREATE INDEX idx_study_papers_branch ON study_papers(branch_id);

CREATE TABLE trip_locations (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    trip_id UUID NOT NULL REFERENCES trips(id),
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    speed_kmh DECIMAL(6,2),
    recorded_at TIMESTAMP NOT NULL,
    note VARCHAR(200)
);

CREATE INDEX idx_trip_locations_trip ON trip_locations(trip_id);
CREATE INDEX idx_trip_locations_recorded ON trip_locations(recorded_at);
