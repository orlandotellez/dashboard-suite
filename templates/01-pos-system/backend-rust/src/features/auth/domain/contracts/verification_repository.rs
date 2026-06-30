use async_trait::async_trait;
use chrono::{DateTime, Utc};

use crate::shared::errors::app_error::AppError;

#[async_trait]
pub trait VerificationRepository: Send + Sync + 'static {
    async fn create(
        &self,
        identifier: &str,
        value: &str,
        expires_at: DateTime<Utc>,
    ) -> Result<(), AppError>;
}
