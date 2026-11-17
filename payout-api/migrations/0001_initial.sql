CREATE TABLE IF NOT EXISTS oauth_states (
  state TEXT PRIMARY KEY,
  driver_uid TEXT NOT NULL,
  code_verifier TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS oauth_states_created_at_idx ON oauth_states(created_at);

CREATE TABLE IF NOT EXISTS payment_accounts (
  driver_uid TEXT PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider = 'mercadopago'),
  account_email TEXT NOT NULL,
  mp_user_id TEXT NOT NULL,
  linked_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS withdrawals (
  id TEXT PRIMARY KEY,
  driver_uid TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL CHECK (currency = 'COP'),
  account_email TEXT NOT NULL,
  status TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode = 'test'),
  idempotency_key TEXT NOT NULL UNIQUE,
  provider_payout_id TEXT,
  provider_transaction_id TEXT,
  provider_status TEXT,
  status_detail TEXT,
  failure_code TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS withdrawals_driver_created_idx ON withdrawals(driver_uid, created_at DESC);

CREATE TABLE IF NOT EXISTS payout_locks (
  driver_uid TEXT PRIMARY KEY,
  locked_at INTEGER NOT NULL
);
