use chrono::Utc;

use crate::{
    features::auth::{
        domain::contracts::{
            account_repository::AccountRepository, session_repository::SessionRepository,
            user_repository::UserRepository,
        },
        infrastructure::sqlx::{
            account_repository::SqlxAccountRepository, session_repository::SqlxSessionRepository,
            user_respository::SqlxUserRepository,
        },
        presentation::dto::{RegisterResponse, UserResponse},
    },
    shared::{
        errors::app_error::AppError,
        security::{jwt, password::verify_password},
        state::app_state::AppState,
    },
};

pub struct AuthenticationService;

impl AuthenticationService {
    pub async fn login(
        state: &AppState,
        email: &str,
        password: &str,
    ) -> Result<RegisterResponse, AppError> {
        // 1. Buscar usuario + credenciales
        let account_repo = SqlxAccountRepository::new(state.db.clone());
        let account = account_repo
            .find_credentials_by_email(email)
            .await?
            .ok_or_else(|| AppError::Unauthorized("Invalid credentials".to_string()))?;

        // 2. Verificar que tenga password
        let hashed_password = account
            .password
            .ok_or_else(|| AppError::Unauthorized("Invalid credentials".to_string()))?;

        // 3. Verificar password
        let valid = verify_password(password, &hashed_password)?;
        if !valid {
            return Err(AppError::Unauthorized("Invalid credentials".to_string()));
        }

        // 4. Generar tokens JWT
        let token_pair = jwt::generate_tokens(
            &account.user_id.to_string(),
            &account.email,
            account.role.as_deref().unwrap_or("cajero"),
        )?;

        // 5. Crear sesión con refresh token
        let session_repo = SqlxSessionRepository::new(state.db.clone());
        session_repo
            .create(
                account.user_id,
                &token_pair.refresh_token,
                Utc::now() + chrono::Duration::days(7),
            )
            .await?;

        // 6. Armar response
        let user_response = UserResponse {
            id: account.user_id,
            name: account.name,
            email: account.email,
            email_verified: account.email_verified,
            role: account.role,
            image: account.image,
            created_at: account.created_at,
            updated_at: account.updated_at,
        };

        Ok(RegisterResponse {
            message: "Login successful".to_string(),
            user: user_response,
            access_token: token_pair.access_token,
            refresh_token: token_pair.refresh_token,
        })
    }

    pub async fn refresh(
        state: &AppState,
        refresh_token: &str,
    ) -> Result<RegisterResponse, AppError> {
        // 1. Verificar JWT del refresh token
        let claims = jwt::verify_refresh_token(refresh_token)?;
        let user_id = uuid::Uuid::parse_str(&claims.sub)
            .map_err(|_| AppError::BadRequest("Invalid token payload".to_string()))?;

        let user_repo = SqlxUserRepository::new(state.db.clone());
        let session_repo = SqlxSessionRepository::new(state.db.clone());

        // 2. Buscar sesión por token
        let session = session_repo
            .find_by_token(refresh_token)
            .await?
            .ok_or_else(|| AppError::Unauthorized("Invalid refresh token".to_string()))?;

        // 3. Verificar que la sesión no haya expirado
        if session.expires_at < Utc::now() {
            tracing::warn!("[refresh] Sesión expirada, eliminando");
            session_repo.delete_by_token(refresh_token).await?;
            return Err(AppError::Unauthorized("Session expired".to_string()));
        }

        // 4. Buscar usuario (con deleted_at IS NULL)
        let user = user_repo
            .find_by_id(user_id)
            .await?
            .ok_or_else(|| AppError::Unauthorized("User not found".to_string()))?;

        // 5. Eliminar sesión anterior (rotation)
        session_repo.delete_by_token(refresh_token).await?;

        // 6. Generar nuevos tokens
        let token_pair = jwt::generate_tokens(
            &user.id.to_string(),
            &user.email,
            user.role.as_deref().unwrap_or("cajero"),
        )?;

        // 7. Crear nueva sesión
        session_repo
            .create(
                user.id,
                &token_pair.refresh_token,
                Utc::now() + chrono::Duration::days(7),
            )
            .await?;

        // 8. Armar response
        Ok(RegisterResponse {
            message: "Token refreshed successfully".to_string(),
            user: UserResponse::from(user),
            access_token: token_pair.access_token,
            refresh_token: token_pair.refresh_token,
        })
    }
}
