use chrono::{DateTime, Utc};
use sqlx::prelude::FromRow;
use uuid::Uuid;

/// Fila de la tabla `session`.
#[derive(Debug, FromRow)]
pub struct Session {
    pub id: Uuid,
    pub user_id: Uuid,
    pub token: String,
    pub expires_at: DateTime<Utc>,
}
