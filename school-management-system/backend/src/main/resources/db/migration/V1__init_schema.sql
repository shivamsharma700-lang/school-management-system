-- School Management System schema
-- Non-destructive initial migration. Historical academic data is preserved by design.

CREATE TABLE branches (
    id UUID PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) NOT NULL,
    address VARCHAR(500),
    phone VARCHAR(30),
    email VARCHAR(150),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_branches_code UNIQUE (code),
    CONSTRAINT ck_branches_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE academic_years (
    id UUID PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_academic_years_name UNIQUE (name),
    CONSTRAINT ck_academic_years_status CHECK (status IN ('UPCOMING', 'ACTIVE', 'ARCHIVED')),
    CONSTRAINT ck_academic_years_dates CHECK (end_date > start_date)
);

CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    username VARCHAR(80) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    mobile VARCHAR(30),
    role VARCHAR(30) NOT NULL,
    branch_id UUID,
    status VARCHAR(20) NOT NULL,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT fk_users_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT ck_users_role CHECK (role IN (
        'SUPER_ADMIN', 'BRANCH_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTANT', 'PARENT', 'STUDENT'
    )),
    CONSTRAINT ck_users_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'LOCKED'))
);

CREATE INDEX ix_users_branch_role ON users (branch_id, role);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_refresh_tokens_hash UNIQUE (token_hash),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX ix_refresh_tokens_user ON refresh_tokens (user_id);

CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_password_reset_hash UNIQUE (token_hash),
    CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE school_classes (
    id UUID PRIMARY KEY,
    branch_id UUID NOT NULL,
    name VARCHAR(50) NOT NULL,
    grade_level INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_classes_branch_name UNIQUE (branch_id, name),
    CONSTRAINT fk_classes_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT ck_classes_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE sections (
    id UUID PRIMARY KEY,
    class_id UUID NOT NULL,
    name VARCHAR(20) NOT NULL,
    capacity INTEGER,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_sections_class_name UNIQUE (class_id, name),
    CONSTRAINT fk_sections_class FOREIGN KEY (class_id) REFERENCES school_classes (id),
    CONSTRAINT ck_sections_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE subjects (
    id UUID PRIMARY KEY,
    branch_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_subjects_branch_code UNIQUE (branch_id, code),
    CONSTRAINT fk_subjects_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT ck_subjects_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE class_subjects (
    id UUID PRIMARY KEY,
    class_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_class_subjects UNIQUE (class_id, subject_id, academic_year_id),
    CONSTRAINT fk_class_subjects_class FOREIGN KEY (class_id) REFERENCES school_classes (id),
    CONSTRAINT fk_class_subjects_subject FOREIGN KEY (subject_id) REFERENCES subjects (id),
    CONSTRAINT fk_class_subjects_year FOREIGN KEY (academic_year_id) REFERENCES academic_years (id)
);

CREATE TABLE staff (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    employee_code VARCHAR(30) NOT NULL,
    designation VARCHAR(80) NOT NULL,
    staff_type VARCHAR(20) NOT NULL,
    qualification VARCHAR(200),
    joining_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_staff_user UNIQUE (user_id),
    CONSTRAINT uk_staff_branch_employee UNIQUE (branch_id, employee_code),
    CONSTRAINT fk_staff_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_staff_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT ck_staff_type CHECK (staff_type IN ('TEACHER', 'STAFF', 'ACCOUNTANT', 'PRINCIPAL', 'ADMIN')),
    CONSTRAINT ck_staff_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE teacher_subjects (
    id UUID PRIMARY KEY,
    staff_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_teacher_subjects UNIQUE (staff_id, subject_id),
    CONSTRAINT fk_teacher_subjects_staff FOREIGN KEY (staff_id) REFERENCES staff (id),
    CONSTRAINT fk_teacher_subjects_subject FOREIGN KEY (subject_id) REFERENCES subjects (id)
);

CREATE TABLE teacher_assignments (
    id UUID PRIMARY KEY,
    staff_id UUID NOT NULL,
    class_id UUID NOT NULL,
    section_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_teacher_assignments UNIQUE (staff_id, class_id, section_id, subject_id, academic_year_id),
    CONSTRAINT fk_teacher_assignments_staff FOREIGN KEY (staff_id) REFERENCES staff (id),
    CONSTRAINT fk_teacher_assignments_class FOREIGN KEY (class_id) REFERENCES school_classes (id),
    CONSTRAINT fk_teacher_assignments_section FOREIGN KEY (section_id) REFERENCES sections (id),
    CONSTRAINT fk_teacher_assignments_subject FOREIGN KEY (subject_id) REFERENCES subjects (id),
    CONSTRAINT fk_teacher_assignments_year FOREIGN KEY (academic_year_id) REFERENCES academic_years (id)
);

CREATE TABLE students (
    id UUID PRIMARY KEY,
    user_id UUID,
    branch_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    class_id UUID,
    section_id UUID,
    admission_number VARCHAR(40) NOT NULL,
    student_code VARCHAR(40) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    photo_file_id UUID,
    mobile VARCHAR(30),
    email VARCHAR(150),
    address VARCHAR(500),
    admission_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_students_branch_admission UNIQUE (branch_id, admission_number),
    CONSTRAINT uk_students_branch_code UNIQUE (branch_id, student_code),
    CONSTRAINT uk_students_user UNIQUE (user_id),
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_students_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_students_year FOREIGN KEY (academic_year_id) REFERENCES academic_years (id),
    CONSTRAINT fk_students_class FOREIGN KEY (class_id) REFERENCES school_classes (id),
    CONSTRAINT fk_students_section FOREIGN KEY (section_id) REFERENCES sections (id),
    CONSTRAINT ck_students_gender CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    CONSTRAINT ck_students_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'ALUMNI', 'TRANSFERRED'))
);

CREATE INDEX ix_students_branch_name ON students (branch_id, full_name);
CREATE INDEX ix_students_section ON students (section_id);

CREATE TABLE guardians (
    id UUID PRIMARY KEY,
    user_id UUID,
    full_name VARCHAR(150) NOT NULL,
    mobile VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    address VARCHAR(500),
    occupation VARCHAR(100),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_guardians_user UNIQUE (user_id),
    CONSTRAINT fk_guardians_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT ck_guardians_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE guardian_students (
    id UUID PRIMARY KEY,
    guardian_id UUID NOT NULL,
    student_id UUID NOT NULL,
    relationship VARCHAR(40) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_guardian_students UNIQUE (guardian_id, student_id),
    CONSTRAINT fk_guardian_students_guardian FOREIGN KEY (guardian_id) REFERENCES guardians (id),
    CONSTRAINT fk_guardian_students_student FOREIGN KEY (student_id) REFERENCES students (id)
);

CREATE TABLE enrollments (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    class_id UUID NOT NULL,
    section_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_enrollments_student_year UNIQUE (student_id, academic_year_id),
    CONSTRAINT fk_enrollments_student FOREIGN KEY (student_id) REFERENCES students (id),
    CONSTRAINT fk_enrollments_year FOREIGN KEY (academic_year_id) REFERENCES academic_years (id),
    CONSTRAINT fk_enrollments_class FOREIGN KEY (class_id) REFERENCES school_classes (id),
    CONSTRAINT fk_enrollments_section FOREIGN KEY (section_id) REFERENCES sections (id),
    CONSTRAINT ck_enrollments_status CHECK (status IN ('ENROLLED', 'WITHDRAWN', 'COMPLETED'))
);

CREATE TABLE timetable_slots (
    id UUID PRIMARY KEY,
    branch_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    class_id UUID NOT NULL,
    section_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    staff_id UUID NOT NULL,
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(40),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_timetable_section_slot UNIQUE (section_id, academic_year_id, day_of_week, start_time),
    CONSTRAINT uk_timetable_teacher_slot UNIQUE (staff_id, academic_year_id, day_of_week, start_time),
    CONSTRAINT fk_timetable_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_timetable_year FOREIGN KEY (academic_year_id) REFERENCES academic_years (id),
    CONSTRAINT fk_timetable_class FOREIGN KEY (class_id) REFERENCES school_classes (id),
    CONSTRAINT fk_timetable_section FOREIGN KEY (section_id) REFERENCES sections (id),
    CONSTRAINT fk_timetable_subject FOREIGN KEY (subject_id) REFERENCES subjects (id),
    CONSTRAINT fk_timetable_staff FOREIGN KEY (staff_id) REFERENCES staff (id),
    CONSTRAINT ck_timetable_day CHECK (day_of_week BETWEEN 1 AND 7),
    CONSTRAINT ck_timetable_time CHECK (end_time > start_time)
);

CREATE TABLE student_attendance (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    class_id UUID NOT NULL,
    section_id UUID NOT NULL,
    attendance_date DATE NOT NULL,
    session_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    remarks VARCHAR(250),
    marked_by UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_student_attendance UNIQUE (student_id, attendance_date, session_type),
    CONSTRAINT fk_student_attendance_student FOREIGN KEY (student_id) REFERENCES students (id),
    CONSTRAINT fk_student_attendance_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_student_attendance_year FOREIGN KEY (academic_year_id) REFERENCES academic_years (id),
    CONSTRAINT fk_student_attendance_class FOREIGN KEY (class_id) REFERENCES school_classes (id),
    CONSTRAINT fk_student_attendance_section FOREIGN KEY (section_id) REFERENCES sections (id),
    CONSTRAINT fk_student_attendance_marker FOREIGN KEY (marked_by) REFERENCES users (id),
    CONSTRAINT ck_student_attendance_session CHECK (session_type IN ('FULL_DAY', 'MORNING', 'AFTERNOON')),
    CONSTRAINT ck_student_attendance_status CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'LEAVE', 'HALF_DAY'))
);

CREATE INDEX ix_student_attendance_date ON student_attendance (branch_id, attendance_date);

CREATE TABLE staff_attendance (
    id UUID PRIMARY KEY,
    staff_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    remarks VARCHAR(250),
    marked_by UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_staff_attendance UNIQUE (staff_id, attendance_date),
    CONSTRAINT fk_staff_attendance_staff FOREIGN KEY (staff_id) REFERENCES staff (id),
    CONSTRAINT fk_staff_attendance_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_staff_attendance_marker FOREIGN KEY (marked_by) REFERENCES users (id),
    CONSTRAINT ck_staff_attendance_status CHECK (status IN ('PRESENT', 'ABSENT', 'LEAVE', 'LATE'))
);

CREATE TABLE homework (
    id UUID PRIMARY KEY,
    branch_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    class_id UUID NOT NULL,
    section_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    staff_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(4000) NOT NULL,
    due_date DATE NOT NULL,
    attachment_file_id UUID,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_homework_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_homework_year FOREIGN KEY (academic_year_id) REFERENCES academic_years (id),
    CONSTRAINT fk_homework_class FOREIGN KEY (class_id) REFERENCES school_classes (id),
    CONSTRAINT fk_homework_section FOREIGN KEY (section_id) REFERENCES sections (id),
    CONSTRAINT fk_homework_subject FOREIGN KEY (subject_id) REFERENCES subjects (id),
    CONSTRAINT fk_homework_staff FOREIGN KEY (staff_id) REFERENCES staff (id)
);

CREATE INDEX ix_homework_section ON homework (section_id, due_date);

CREATE TABLE homework_submissions (
    id UUID PRIMARY KEY,
    homework_id UUID NOT NULL,
    student_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL,
    submitted_at TIMESTAMP,
    remarks VARCHAR(500),
    attachment_file_id UUID,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_homework_submissions UNIQUE (homework_id, student_id),
    CONSTRAINT fk_homework_submissions_hw FOREIGN KEY (homework_id) REFERENCES homework (id),
    CONSTRAINT fk_homework_submissions_student FOREIGN KEY (student_id) REFERENCES students (id),
    CONSTRAINT ck_homework_submissions_status CHECK (status IN ('PENDING', 'SUBMITTED', 'LATE', 'REVIEWED'))
);

CREATE TABLE exams (
    id UUID PRIMARY KEY,
    branch_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    exam_type VARCHAR(40) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_exams_branch_year_name UNIQUE (branch_id, academic_year_id, name),
    CONSTRAINT fk_exams_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_exams_year FOREIGN KEY (academic_year_id) REFERENCES academic_years (id),
    CONSTRAINT ck_exams_status CHECK (status IN ('DRAFT', 'SCHEDULED', 'COMPLETED', 'PUBLISHED'))
);

CREATE TABLE exam_subjects (
    id UUID PRIMARY KEY,
    exam_id UUID NOT NULL,
    class_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    max_marks NUMERIC(8, 2) NOT NULL,
    passing_marks NUMERIC(8, 2) NOT NULL,
    exam_date DATE,
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_exam_subjects UNIQUE (exam_id, class_id, subject_id),
    CONSTRAINT fk_exam_subjects_exam FOREIGN KEY (exam_id) REFERENCES exams (id),
    CONSTRAINT fk_exam_subjects_class FOREIGN KEY (class_id) REFERENCES school_classes (id),
    CONSTRAINT fk_exam_subjects_subject FOREIGN KEY (subject_id) REFERENCES subjects (id),
    CONSTRAINT ck_exam_subjects_marks CHECK (max_marks > 0 AND passing_marks >= 0 AND passing_marks <= max_marks)
);

CREATE TABLE marks (
    id UUID PRIMARY KEY,
    exam_subject_id UUID NOT NULL,
    student_id UUID NOT NULL,
    marks_obtained NUMERIC(8, 2) NOT NULL,
    grade VARCHAR(5),
    remarks VARCHAR(250),
    entered_by UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_marks UNIQUE (exam_subject_id, student_id),
    CONSTRAINT fk_marks_exam_subject FOREIGN KEY (exam_subject_id) REFERENCES exam_subjects (id),
    CONSTRAINT fk_marks_student FOREIGN KEY (student_id) REFERENCES students (id),
    CONSTRAINT fk_marks_entered_by FOREIGN KEY (entered_by) REFERENCES users (id)
);

CREATE TABLE fee_structures (
    id UUID PRIMARY KEY,
    branch_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    class_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_fee_structures UNIQUE (branch_id, academic_year_id, class_id, name),
    CONSTRAINT fk_fee_structures_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_fee_structures_year FOREIGN KEY (academic_year_id) REFERENCES academic_years (id),
    CONSTRAINT fk_fee_structures_class FOREIGN KEY (class_id) REFERENCES school_classes (id),
    CONSTRAINT ck_fee_structures_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE fee_components (
    id UUID PRIMARY KEY,
    fee_structure_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    component_type VARCHAR(30) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_fee_components UNIQUE (fee_structure_id, name),
    CONSTRAINT fk_fee_components_structure FOREIGN KEY (fee_structure_id) REFERENCES fee_structures (id),
    CONSTRAINT ck_fee_components_type CHECK (component_type IN ('BASE', 'DISCOUNT', 'LATE_FEE', 'OTHER')),
    CONSTRAINT ck_fee_components_amount CHECK (amount >= 0)
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    fee_structure_id UUID,
    invoice_number VARCHAR(40) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    base_amount NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    late_fee_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    other_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_invoices_number UNIQUE (invoice_number),
    CONSTRAINT fk_invoices_student FOREIGN KEY (student_id) REFERENCES students (id),
    CONSTRAINT fk_invoices_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_invoices_year FOREIGN KEY (academic_year_id) REFERENCES academic_years (id),
    CONSTRAINT fk_invoices_structure FOREIGN KEY (fee_structure_id) REFERENCES fee_structures (id),
    CONSTRAINT ck_invoices_status CHECK (status IN ('PENDING', 'PARTIAL', 'PAID', 'CANCELLED'))
);

CREATE INDEX ix_invoices_student ON invoices (student_id, status);

CREATE TABLE payments (
    id UUID PRIMARY KEY,
    invoice_id UUID NOT NULL,
    student_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    method VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL,
    idempotency_key VARCHAR(80) NOT NULL,
    gateway_order_id VARCHAR(80),
    gateway_payment_id VARCHAR(80),
    failure_reason VARCHAR(250),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_payments_idempotency UNIQUE (idempotency_key),
    CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices (id),
    CONSTRAINT fk_payments_student FOREIGN KEY (student_id) REFERENCES students (id),
    CONSTRAINT fk_payments_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT ck_payments_method CHECK (method IN ('CASH', 'CARD', 'UPI', 'NET_BANKING', 'GATEWAY', 'CHEQUE')),
    CONSTRAINT ck_payments_status CHECK (status IN ('CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED')),
    CONSTRAINT ck_payments_amount CHECK (amount > 0)
);

CREATE TABLE receipts (
    id UUID PRIMARY KEY,
    payment_id UUID NOT NULL,
    receipt_number VARCHAR(40) NOT NULL,
    issued_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_receipts_payment UNIQUE (payment_id),
    CONSTRAINT uk_receipts_number UNIQUE (receipt_number),
    CONSTRAINT fk_receipts_payment FOREIGN KEY (payment_id) REFERENCES payments (id)
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    recipient_user_id UUID NOT NULL,
    branch_id UUID,
    type VARCHAR(40) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body VARCHAR(2000) NOT NULL,
    entity_type VARCHAR(40),
    entity_id UUID,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_notifications_user FOREIGN KEY (recipient_user_id) REFERENCES users (id),
    CONSTRAINT fk_notifications_branch FOREIGN KEY (branch_id) REFERENCES branches (id)
);

CREATE INDEX ix_notifications_recipient ON notifications (recipient_user_id, created_at);

CREATE TABLE notices (
    id UUID PRIMARY KEY,
    branch_id UUID,
    title VARCHAR(200) NOT NULL,
    body VARCHAR(4000) NOT NULL,
    audience_type VARCHAR(30) NOT NULL,
    class_id UUID,
    section_id UUID,
    role_target VARCHAR(30),
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_notices_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_notices_class FOREIGN KEY (class_id) REFERENCES school_classes (id),
    CONSTRAINT fk_notices_section FOREIGN KEY (section_id) REFERENCES sections (id),
    CONSTRAINT fk_notices_created_by FOREIGN KEY (created_by) REFERENCES users (id),
    CONSTRAINT ck_notices_audience CHECK (audience_type IN ('SCHOOL', 'BRANCH', 'CLASS', 'SECTION', 'ROLE'))
);

CREATE TABLE complaints (
    id UUID PRIMARY KEY,
    branch_id UUID NOT NULL,
    created_by UUID NOT NULL,
    student_id UUID,
    category VARCHAR(40) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(4000) NOT NULL,
    status VARCHAR(20) NOT NULL,
    assigned_to UUID,
    resolution VARCHAR(4000),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_complaints_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_complaints_created_by FOREIGN KEY (created_by) REFERENCES users (id),
    CONSTRAINT fk_complaints_student FOREIGN KEY (student_id) REFERENCES students (id),
    CONSTRAINT fk_complaints_assigned FOREIGN KEY (assigned_to) REFERENCES users (id),
    CONSTRAINT ck_complaints_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'))
);

CREATE TABLE complaint_comments (
    id UUID PRIMARY KEY,
    complaint_id UUID NOT NULL,
    author_id UUID NOT NULL,
    body VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_complaint_comments_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id),
    CONSTRAINT fk_complaint_comments_author FOREIGN KEY (author_id) REFERENCES users (id)
);

CREATE TABLE leave_requests (
    id UUID PRIMARY KEY,
    branch_id UUID NOT NULL,
    requester_id UUID NOT NULL,
    student_id UUID,
    staff_id UUID,
    leave_type VARCHAR(30) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(1000) NOT NULL,
    status VARCHAR(20) NOT NULL,
    reviewer_id UUID,
    review_note VARCHAR(1000),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_leave_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_leave_requester FOREIGN KEY (requester_id) REFERENCES users (id),
    CONSTRAINT fk_leave_student FOREIGN KEY (student_id) REFERENCES students (id),
    CONSTRAINT fk_leave_staff FOREIGN KEY (staff_id) REFERENCES staff (id),
    CONSTRAINT fk_leave_reviewer FOREIGN KEY (reviewer_id) REFERENCES users (id),
    CONSTRAINT ck_leave_dates CHECK (end_date >= start_date),
    CONSTRAINT ck_leave_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    CONSTRAINT ck_leave_type CHECK (leave_type IN ('SICK', 'CASUAL', 'EMERGENCY', 'OTHER'))
);

CREATE INDEX ix_leave_requester ON leave_requests (requester_id, status);

CREATE TABLE vehicles (
    id UUID PRIMARY KEY,
    branch_id UUID NOT NULL,
    registration_number VARCHAR(30) NOT NULL,
    vehicle_type VARCHAR(40) NOT NULL,
    capacity INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_vehicles_reg UNIQUE (registration_number),
    CONSTRAINT fk_vehicles_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT ck_vehicles_status CHECK (status IN ('ACTIVE', 'MAINTENANCE', 'INACTIVE'))
);

CREATE TABLE drivers (
    id UUID PRIMARY KEY,
    branch_id UUID NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    license_number VARCHAR(40) NOT NULL,
    mobile VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_drivers_license UNIQUE (license_number),
    CONSTRAINT fk_drivers_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT ck_drivers_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE routes (
    id UUID PRIMARY KEY,
    branch_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    vehicle_id UUID,
    driver_id UUID,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_routes_branch_name UNIQUE (branch_id, name),
    CONSTRAINT fk_routes_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_routes_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles (id),
    CONSTRAINT fk_routes_driver FOREIGN KEY (driver_id) REFERENCES drivers (id),
    CONSTRAINT ck_routes_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE route_stops (
    id UUID PRIMARY KEY,
    route_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    sequence_no INTEGER NOT NULL,
    arrival_time TIME,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_route_stops UNIQUE (route_id, sequence_no),
    CONSTRAINT fk_route_stops_route FOREIGN KEY (route_id) REFERENCES routes (id)
);

CREATE TABLE student_transports (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    route_id UUID NOT NULL,
    stop_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_student_transports UNIQUE (student_id, academic_year_id),
    CONSTRAINT fk_student_transports_student FOREIGN KEY (student_id) REFERENCES students (id),
    CONSTRAINT fk_student_transports_route FOREIGN KEY (route_id) REFERENCES routes (id),
    CONSTRAINT fk_student_transports_stop FOREIGN KEY (stop_id) REFERENCES route_stops (id),
    CONSTRAINT fk_student_transports_year FOREIGN KEY (academic_year_id) REFERENCES academic_years (id),
    CONSTRAINT ck_student_transports_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE trips (
    id UUID PRIMARY KEY,
    route_id UUID NOT NULL,
    trip_date DATE NOT NULL,
    trip_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    tracking_token_hash VARCHAR(64),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_trips UNIQUE (route_id, trip_date, trip_type),
    CONSTRAINT fk_trips_route FOREIGN KEY (route_id) REFERENCES routes (id),
    CONSTRAINT ck_trips_type CHECK (trip_type IN ('MORNING', 'EVENING')),
    CONSTRAINT ck_trips_status CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
);

CREATE TABLE book_categories (
    id UUID PRIMARY KEY,
    branch_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_book_categories UNIQUE (branch_id, name),
    CONSTRAINT fk_book_categories_branch FOREIGN KEY (branch_id) REFERENCES branches (id)
);

CREATE TABLE authors (
    id UUID PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_authors_name UNIQUE (name)
);

CREATE TABLE books (
    id UUID PRIMARY KEY,
    branch_id UUID NOT NULL,
    category_id UUID NOT NULL,
    author_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    isbn VARCHAR(30),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_books_branch_isbn UNIQUE (branch_id, isbn),
    CONSTRAINT fk_books_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_books_category FOREIGN KEY (category_id) REFERENCES book_categories (id),
    CONSTRAINT fk_books_author FOREIGN KEY (author_id) REFERENCES authors (id)
);

CREATE TABLE book_copies (
    id UUID PRIMARY KEY,
    book_id UUID NOT NULL,
    copy_code VARCHAR(40) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_book_copies_code UNIQUE (copy_code),
    CONSTRAINT fk_book_copies_book FOREIGN KEY (book_id) REFERENCES books (id),
    CONSTRAINT ck_book_copies_status CHECK (status IN ('AVAILABLE', 'ISSUED', 'LOST', 'MAINTENANCE'))
);

CREATE TABLE book_loans (
    id UUID PRIMARY KEY,
    copy_id UUID NOT NULL,
    student_id UUID NOT NULL,
    issued_by UUID NOT NULL,
    issued_at TIMESTAMP NOT NULL,
    due_date DATE NOT NULL,
    returned_at TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_book_loans_copy FOREIGN KEY (copy_id) REFERENCES book_copies (id),
    CONSTRAINT fk_book_loans_student FOREIGN KEY (student_id) REFERENCES students (id),
    CONSTRAINT fk_book_loans_issued_by FOREIGN KEY (issued_by) REFERENCES users (id),
    CONSTRAINT ck_book_loans_status CHECK (status IN ('ISSUED', 'RETURNED', 'OVERDUE'))
);

CREATE INDEX ix_book_loans_student ON book_loans (student_id, status);

CREATE TABLE stored_files (
    id UUID PRIMARY KEY,
    original_name VARCHAR(200) NOT NULL,
    stored_name VARCHAR(200) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    uploaded_by UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_stored_files_stored_name UNIQUE (stored_name),
    CONSTRAINT fk_stored_files_user FOREIGN KEY (uploaded_by) REFERENCES users (id)
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    role VARCHAR(30),
    branch_id UUID,
    action VARCHAR(80) NOT NULL,
    entity_type VARCHAR(80) NOT NULL,
    entity_id VARCHAR(80),
    metadata VARCHAR(2000),
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_audit_logs_branch FOREIGN KEY (branch_id) REFERENCES branches (id)
);

CREATE INDEX ix_audit_logs_created ON audit_logs (created_at);
CREATE INDEX ix_audit_logs_entity ON audit_logs (entity_type, entity_id);
