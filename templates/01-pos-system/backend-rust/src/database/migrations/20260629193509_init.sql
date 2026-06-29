-- ENUMS

CREATE TYPE role AS ENUM ('admin', 'gerente', 'cajero');

CREATE TYPE unit_type AS ENUM (
    'unidad',
    'paquete',
    'caja',
    'bolsa',
    'botella',
    'lata',
    'sobre',
    'barra',
    'rollo',
    'galon',
    'ristra'
);

-- AUTH: users

CREATE TABLE IF NOT EXISTS users (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT            NOT NULL,
    email           TEXT            NOT NULL UNIQUE,
    email_verified  BOOLEAN         NOT NULL DEFAULT FALSE,
    phone           TEXT,
    image           TEXT,
    role            role            NOT NULL DEFAULT 'cajero',

    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- AUTH: session

CREATE TABLE IF NOT EXISTS session (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    expires_at  TIMESTAMPTZ     NOT NULL,
    token       TEXT            NOT NULL,
    ip_address  TEXT,
    user_agent  TEXT,
    user_id     UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_user_id ON session(user_id);

-- AUTH: account

CREATE TABLE IF NOT EXISTS account (
    id                          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id                  TEXT            NOT NULL,
    provider_id                 TEXT            NOT NULL,
    user_id                     UUID            REFERENCES users(id) ON DELETE CASCADE,

    access_token                TEXT,
    refresh_token               TEXT,
    id_token                    TEXT,
    access_token_expires_at     TIMESTAMPTZ,
    refresh_token_expires_at    TIMESTAMPTZ,
    scope                       TEXT,
    password                    TEXT,

    created_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_account_user_id ON account(user_id);

-- AUTH: verification

CREATE TABLE IF NOT EXISTS verification (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier  TEXT            NOT NULL,
    value       TEXT            NOT NULL,
    expires_at  TIMESTAMPTZ     NOT NULL,

    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- PRODUCTOS: categories

CREATE TABLE IF NOT EXISTS categories (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT            NOT NULL UNIQUE,
    description TEXT,

    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_deleted_at ON categories(deleted_at);

-- PRODUCTOS: suppliers

CREATE TABLE IF NOT EXISTS suppliers (
    id           UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT            NOT NULL,
    contact_name TEXT,
    email        TEXT,
    phone        TEXT,
    address      TEXT,
    notes        TEXT,
    is_active    BOOLEAN         NOT NULL DEFAULT TRUE,

    created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON suppliers(is_active);

-- PRODUCTOS: products

CREATE TABLE IF NOT EXISTS products (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    barcode             TEXT,
    name                TEXT            NOT NULL,
    unit_type           unit_type,
    unit_quantity       INT,
    category_id         UUID            REFERENCES categories(id) ON DELETE SET NULL,
    supplier_id         UUID            REFERENCES suppliers(id) ON DELETE SET NULL,
    price               NUMERIC(10,2)   NOT NULL,
    cost                NUMERIC(10,2)   NOT NULL DEFAULT 0,
    tax_rate            NUMERIC(10,2)   NOT NULL DEFAULT 0,
    stock               INT             NOT NULL DEFAULT 0,
    low_stock_threshold INT             NOT NULL DEFAULT 5,
    active              BOOLEAN         NOT NULL DEFAULT TRUE,

    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

-- SERVICIOS: services

CREATE TABLE IF NOT EXISTS services (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT            NOT NULL,
    description TEXT,
    base_price  NUMERIC(10,2)   NOT NULL,
    is_active   BOOLEAN         NOT NULL DEFAULT TRUE,

    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);

-- SERVICIOS: service_products (relación N:M)

CREATE TABLE IF NOT EXISTS service_products (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id  UUID    NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    product_id  UUID    NOT NULL REFERENCES products(id),
    quantity    INT     NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_service_products_service_id ON service_products(service_id);
CREATE INDEX IF NOT EXISTS idx_service_products_product_id ON service_products(product_id);

-- VENTAS: sales

CREATE TABLE IF NOT EXISTS sales (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    subtotal        NUMERIC(10,2)   NOT NULL,
    tax_total       NUMERIC(10,2)   NOT NULL DEFAULT 0,
    discount        NUMERIC(10,2)   NOT NULL DEFAULT 0,
    total           NUMERIC(10,2)   NOT NULL,
    payment_method  TEXT            NOT NULL,
    amount_received NUMERIC(10,2),
    change_given    NUMERIC(10,2),
    user_id         UUID            NOT NULL REFERENCES users(id),

    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);

-- VENTAS: sale_items

CREATE TABLE IF NOT EXISTS sale_items (
    id           UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id      UUID            NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id   UUID            NOT NULL REFERENCES products(id),
    product_name TEXT            NOT NULL,
    quantity     INT             NOT NULL,
    unit_price   NUMERIC(10,2)   NOT NULL,
    tax_rate     NUMERIC(10,2)   NOT NULL DEFAULT 0,
    line_total   NUMERIC(10,2)   NOT NULL,

    created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);

-- VENTAS: sale_services

CREATE TABLE IF NOT EXISTS sale_services (
    id           UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id      UUID            NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    service_id   UUID            NOT NULL REFERENCES services(id),
    service_name TEXT            NOT NULL,
    base_price   NUMERIC(10,2)   NOT NULL,
    line_total   NUMERIC(10,2)   NOT NULL,

    created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sale_services_sale_id ON sale_services(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_services_service_id ON sale_services(service_id);

-- VENTAS: sale_service_products

CREATE TABLE IF NOT EXISTS sale_service_products (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_service_id UUID            NOT NULL REFERENCES sale_services(id) ON DELETE CASCADE,
    product_id      UUID            NOT NULL REFERENCES products(id),
    product_name    TEXT            NOT NULL,
    quantity        INT             NOT NULL,
    unit_price      NUMERIC(10,2)   NOT NULL,
    line_total      NUMERIC(10,2)   NOT NULL,
    affects_price   BOOLEAN         NOT NULL DEFAULT FALSE,

    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sale_service_products_sale_service_id ON sale_service_products(sale_service_id);
CREATE INDEX IF NOT EXISTS idx_sale_service_products_product_id ON sale_service_products(product_id);

-- INVENTARIO: inventory_batches

CREATE TABLE IF NOT EXISTS inventory_batches (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    movement_type   TEXT            NOT NULL,
    supplier_id     UUID            REFERENCES suppliers(id) ON DELETE SET NULL,
    notes           TEXT,
    user_id         UUID            NOT NULL REFERENCES users(id),

    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_batches_movement_type ON inventory_batches(movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_batches_supplier_id ON inventory_batches(supplier_id);
CREATE INDEX IF NOT EXISTS idx_inventory_batches_created_at ON inventory_batches(created_at);

-- INVENTARIO: inventory_batch_items

CREATE TABLE IF NOT EXISTS inventory_batch_items (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id    UUID            NOT NULL REFERENCES inventory_batches(id) ON DELETE CASCADE,
    product_id  UUID            NOT NULL REFERENCES products(id),
    quantity    INT             NOT NULL,
    unit_cost   NUMERIC(10,2),
    notes       TEXT,

    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_batch_items_batch_id ON inventory_batch_items(batch_id);
CREATE INDEX IF NOT EXISTS idx_inventory_batch_items_product_id ON inventory_batch_items(product_id);

-- INVENTARIO: inventory_movements

CREATE TABLE IF NOT EXISTS inventory_movements (
    id            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id    UUID            NOT NULL REFERENCES products(id),
    movement_type TEXT            NOT NULL,
    quantity      INT             NOT NULL,
    note          TEXT,
    batch_id      UUID            REFERENCES inventory_batches(id) ON DELETE SET NULL,
    user_id       UUID            NOT NULL REFERENCES users(id),

    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_movement_type ON inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_batch_id ON inventory_movements(batch_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at);

-- CONFIG: settings

CREATE TABLE IF NOT EXISTS settings (
    id                  INT             PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name                TEXT            NOT NULL DEFAULT 'Mi Negocio',
    address             TEXT,
    phone               TEXT,
    tax_rate            NUMERIC(10,2)   NOT NULL DEFAULT 16,
    low_stock_threshold INT             NOT NULL DEFAULT 5,
    ticket_footer       TEXT,

    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
