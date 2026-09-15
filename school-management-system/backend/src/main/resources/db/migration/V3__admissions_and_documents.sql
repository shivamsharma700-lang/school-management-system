-- Phase 2: admissions funnel + student documents metadata

CREATE TABLE admission_enquiries (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    branch_id UUID NOT NULL REFERENCES branches(id),
    academic_year_id UUID REFERENCES academic_years(id),
    interested_class_id UUID REFERENCES school_classes(id),
    student_name VARCHAR(150) NOT NULL,
    parent_name VARCHAR(150),
    mobile VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    source VARCHAR(80),
    notes VARCHAR(1000),
    status VARCHAR(30) NOT NULL DEFAULT 'NEW'
);

CREATE INDEX idx_admission_enquiries_branch ON admission_enquiries(branch_id);
CREATE INDEX idx_admission_enquiries_status ON admission_enquiries(status);

CREATE TABLE admission_applications (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    branch_id UUID NOT NULL REFERENCES branches(id),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    enquiry_id UUID REFERENCES admission_enquiries(id),
    class_id UUID REFERENCES school_classes(id),
    section_id UUID REFERENCES sections(id),
    application_number VARCHAR(40) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    parent_name VARCHAR(150) NOT NULL,
    parent_mobile VARCHAR(30) NOT NULL,
    parent_email VARCHAR(150),
    address VARCHAR(500),
    documents_verified BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    review_notes VARCHAR(1000),
    enrolled_student_id UUID REFERENCES students(id),
    UNIQUE (branch_id, application_number)
);

CREATE INDEX idx_admission_applications_branch ON admission_applications(branch_id);
CREATE INDEX idx_admission_applications_status ON admission_applications(status);

CREATE TABLE student_documents (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    student_id UUID NOT NULL REFERENCES students(id),
    file_id UUID NOT NULL REFERENCES stored_files(id),
    doc_type VARCHAR(60) NOT NULL,
    title VARCHAR(150) NOT NULL,
    notes VARCHAR(500)
);

CREATE INDEX idx_student_documents_student ON student_documents(student_id);
