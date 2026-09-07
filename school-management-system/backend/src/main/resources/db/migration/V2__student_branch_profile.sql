-- Demo-friendly profile fields. Safe for production: all columns nullable.
-- One column per ALTER so the script also runs on H2 (tests).

ALTER TABLE students ADD COLUMN father_name VARCHAR(150);
ALTER TABLE students ADD COLUMN mother_name VARCHAR(150);
ALTER TABLE students ADD COLUMN blood_group VARCHAR(8);
ALTER TABLE students ADD COLUMN city VARCHAR(80);
ALTER TABLE students ADD COLUMN state VARCHAR(80);
ALTER TABLE students ADD COLUMN pincode VARCHAR(12);
ALTER TABLE students ADD COLUMN emergency_contact VARCHAR(30);
ALTER TABLE students ADD COLUMN roll_number VARCHAR(20);

CREATE INDEX ix_students_father ON students (father_name);
CREATE INDEX ix_students_gender_status ON students (branch_id, gender, status);

ALTER TABLE branches ADD COLUMN city VARCHAR(80);
ALTER TABLE branches ADD COLUMN state VARCHAR(80);
ALTER TABLE branches ADD COLUMN pincode VARCHAR(12);
ALTER TABLE branches ADD COLUMN principal_name VARCHAR(150);
