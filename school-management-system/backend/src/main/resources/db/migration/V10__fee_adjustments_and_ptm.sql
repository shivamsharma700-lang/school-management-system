-- Phase 2: auditable fee adjustments (discount / late fee / refund / write-off)
-- and parent-teacher meeting scheduling.
--
-- invoices already carried discount_amount and late_fee_amount columns but there
-- was no way to set them and no record of who changed what or why. Storing each
-- adjustment as a row keeps the invoice totals reconstructable and auditable
-- rather than silently overwritten.

CREATE TABLE fee_adjustments (
    id UUID PRIMARY KEY,
    invoice_id UUID NOT NULL,
    student_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    adjustment_type VARCHAR(20) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    reason VARCHAR(400) NOT NULL,
    reference VARCHAR(80),
    status VARCHAR(20) NOT NULL DEFAULT 'APPLIED',
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_fee_adjustments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE,
    CONSTRAINT fk_fee_adjustments_student FOREIGN KEY (student_id) REFERENCES students (id),
    CONSTRAINT fk_fee_adjustments_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_fee_adjustments_creator FOREIGN KEY (created_by) REFERENCES users (id),
    CONSTRAINT fk_fee_adjustments_approver FOREIGN KEY (approved_by) REFERENCES users (id),
    CONSTRAINT ck_fee_adjustments_type CHECK (adjustment_type IN (
        'DISCOUNT', 'LATE_FEE', 'REFUND', 'WRITE_OFF'
    )),
    CONSTRAINT ck_fee_adjustments_status CHECK (status IN (
        'PENDING', 'APPLIED', 'REJECTED', 'REVERSED'
    )),
    CONSTRAINT ck_fee_adjustments_amount CHECK (amount > 0)
);

CREATE INDEX idx_fee_adjustments_invoice ON fee_adjustments (invoice_id);
CREATE INDEX idx_fee_adjustments_student ON fee_adjustments (student_id);
CREATE INDEX idx_fee_adjustments_type ON fee_adjustments (adjustment_type);

-- Parent-teacher meetings: a scheduled slot per teacher, bookable per student.
CREATE TABLE ptm_meetings (
    id UUID PRIMARY KEY,
    branch_id UUID NOT NULL,
    staff_id UUID,
    section_id UUID,
    title VARCHAR(200) NOT NULL,
    meeting_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    venue VARCHAR(200),
    notes VARCHAR(1000),
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    created_by UUID,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_ptm_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_ptm_staff FOREIGN KEY (staff_id) REFERENCES staff (id),
    CONSTRAINT fk_ptm_section FOREIGN KEY (section_id) REFERENCES sections (id),
    CONSTRAINT fk_ptm_creator FOREIGN KEY (created_by) REFERENCES users (id),
    CONSTRAINT ck_ptm_status CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED'))
);

CREATE INDEX idx_ptm_branch_date ON ptm_meetings (branch_id, meeting_date);

CREATE TABLE ptm_bookings (
    id UUID PRIMARY KEY,
    meeting_id UUID NOT NULL,
    student_id UUID NOT NULL,
    guardian_id UUID,
    slot_time TIME,
    status VARCHAR(20) NOT NULL DEFAULT 'BOOKED',
    remarks VARCHAR(1000),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_ptm_booking_meeting FOREIGN KEY (meeting_id) REFERENCES ptm_meetings (id) ON DELETE CASCADE,
    CONSTRAINT fk_ptm_booking_student FOREIGN KEY (student_id) REFERENCES students (id),
    CONSTRAINT fk_ptm_booking_guardian FOREIGN KEY (guardian_id) REFERENCES guardians (id),
    CONSTRAINT uk_ptm_booking UNIQUE (meeting_id, student_id),
    CONSTRAINT ck_ptm_booking_status CHECK (status IN ('BOOKED', 'ATTENDED', 'MISSED', 'CANCELLED'))
);

CREATE INDEX idx_ptm_bookings_student ON ptm_bookings (student_id);

-- Soft-delete support: rows are retired, never physically removed, so history and
-- foreign keys stay intact and the action can be audited.
ALTER TABLE students ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE notices ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE homework ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
