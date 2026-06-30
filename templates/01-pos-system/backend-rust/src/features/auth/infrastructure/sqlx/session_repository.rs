use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    features::auth::{
        domain::contracts::session_repository::SessionRepository,
        infrastructure::models::session::Session,
    },
    shared::errors::app_error::AppError,
};

// ─── Implementación concreta del trait ───

#[derive(Clone)]
pub struct SqlxSessionRepository {
    pool: PgPool,
}

impl SqlxSessionRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl SessionRepository for SqlxSessionRepository {
    async fn find_by_token(&self, token: &str) -> Result<Option<Session>, AppError> {
        let session = sqlx::query_as!(
            Session,
            r#"
            SELECT id, user_id, token, expires_at
            FROM session
            WHERE token = $1
            "#,
            token
        )
        .fetch_optional(&self.pool)
        .await?;

        Ok(session)
    }

    async fn delete_by_token(&self, token: &str) -> Result<(), AppError> {
        sqlx::query!(r#"DELETE FROM session WHERE token = $1"#, token)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    async fn create(
        &self,
        user_id: Uuid,
        token: &str,
        expires_at: DateTime<Utc>,
    ) -> Result<(), AppError> {
        sqlx::query!(
            r#"
            INSERT INTO session (id, expires_at, token, user_id, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            "#,
            Uuid::new_v4(),
            expires_at,
            token,
            user_id,
            Utc::now(),
            Utc::now(),
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }
}
