-- Soft-deactivate + effective dates for teacher assignments

ALTER TABLE teacher_assignments ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE teacher_assignments ADD COLUMN effective_from DATE;
ALTER TABLE teacher_assignments ADD COLUMN effective_to DATE;

ALTER TABLE teacher_assignments ADD CONSTRAINT ck_teacher_assignments_status
    CHECK (status IN ('ACTIVE', 'INACTIVE'));

CREATE INDEX idx_teacher_assignments_staff_status ON teacher_assignments(staff_id, status);
CREATE INDEX idx_teacher_assignments_section ON teacher_assignments(section_id);
