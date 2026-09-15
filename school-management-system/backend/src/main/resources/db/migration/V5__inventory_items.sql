CREATE TABLE inventory_items (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    branch_id UUID NOT NULL REFERENCES branches(id),
    category VARCHAR(80) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    sku VARCHAR(80),
    location VARCHAR(200),
    quantity INT NOT NULL DEFAULT 0,
    unit VARCHAR(40) NOT NULL DEFAULT 'PCS',
    status VARCHAR(30) NOT NULL DEFAULT 'IN_STOCK',
    notes VARCHAR(1000)
);

CREATE INDEX idx_inventory_branch ON inventory_items(branch_id);
CREATE INDEX idx_inventory_category ON inventory_items(category);
