CREATE TABLE school_events (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    branch_id UUID NOT NULL REFERENCES branches(id),
    title VARCHAR(200) NOT NULL,
    event_type VARCHAR(40) NOT NULL,
    audience VARCHAR(40) NOT NULL DEFAULT 'ALL',
    location VARCHAR(200),
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP,
    description VARCHAR(2000),
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED'
);

CREATE INDEX idx_school_events_branch ON school_events(branch_id);
CREATE INDEX idx_school_events_starts ON school_events(starts_at);
