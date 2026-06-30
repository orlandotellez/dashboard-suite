use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;

use crate::{
    features::auth::domain::contracts::verification_repository::VerificationRepository,
    shared::errors::app_error::AppError,
};

// ─── Implementación concreta del trait ───

#[derive(Clone)]
pub struct SqlxVerificationRepository {
    pool: PgPool,
}

impl SqlxVerificationRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl VerificationRepository for SqlxVerificationRepository {
    async fn create(
        &self,
        identifier: &str,
        value: &str,
        expires_at: DateTime<Utc>,
    ) -> Result<(), AppError> {
        sqlx::query!(
            r#"
            INSERT INTO verification (id, identifier, value, expires_at, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            "#,
            Uuid::new_v4(),
            identifier,
            value,
            expires_at,
            Utc::now(),
            Utc::now(),
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }
}

// ─── Operaciones transaccionales (fuera del trait) ───

impl SqlxVerificationRepository {
    pub async fn create_tx(
        tx: &mut Transaction<'_, Postgres>,
        identifier: &str,
        value: &str,
        expires_at: DateTime<Utc>,
    ) -> Result<(), AppError> {
        sqlx::query!(
            r#"
            INSERT INTO verification (id, identifier, value, expires_at, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            "#,
            Uuid::new_v4(),
            identifier,
            value,
            expires_at,
            Utc::now(),
            Utc::now(),
        )
        .execute(tx.as_mut())
        .await?;

        Ok(())
    }
}
