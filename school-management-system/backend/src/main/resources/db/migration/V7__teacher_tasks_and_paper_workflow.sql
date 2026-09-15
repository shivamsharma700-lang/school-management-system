-- Teacher task assignments + study paper approval workflow columns

CREATE TABLE teacher_tasks (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    branch_id UUID NOT NULL REFERENCES branches(id),
    assigned_by_user_id UUID NOT NULL REFERENCES users(id),
    assignee_staff_id UUID NOT NULL REFERENCES staff(id),
    title VARCHAR(200) NOT NULL,
    description VARCHAR(4000) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'TODO',
    due_date DATE NOT NULL,
    class_id UUID REFERENCES school_classes(id),
    section_id UUID REFERENCES sections(id),
    subject_id UUID REFERENCES subjects(id),
    attachment_file_id UUID,
    completed_at TIMESTAMP,
    CONSTRAINT ck_teacher_tasks_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    CONSTRAINT ck_teacher_tasks_status CHECK (status IN ('TODO', 'IN_PROGRESS', 'COMPLETED'))
);

CREATE INDEX idx_teacher_tasks_branch ON teacher_tasks(branch_id);
CREATE INDEX idx_teacher_tasks_assignee ON teacher_tasks(assignee_staff_id);
CREATE INDEX idx_teacher_tasks_status ON teacher_tasks(status);
CREATE INDEX idx_teacher_tasks_due ON teacher_tasks(due_date);

ALTER TABLE study_papers ADD COLUMN created_by_user_id UUID REFERENCES users(id);
ALTER TABLE study_papers ADD COLUMN reviewed_by_user_id UUID REFERENCES users(id);
ALTER TABLE study_papers ADD COLUMN review_notes VARCHAR(1000);
ALTER TABLE study_papers ADD COLUMN section_name VARCHAR(80);
ALTER TABLE study_papers ADD COLUMN exam_name VARCHAR(120);
