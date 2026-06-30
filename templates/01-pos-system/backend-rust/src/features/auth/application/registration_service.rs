use chrono::Utc;

use crate::{
    features::auth::{
        domain::{
            contracts::{
                session_repository::SessionRepository,
                user_repository::UserRepository,
            },
            entities::User,
        },
        infrastructure::sqlx::{
            account_repository::SqlxAccountRepository,
            session_repository::SqlxSessionRepository,
            user_respository::SqlxUserRepository,
            verification_repository::SqlxVerificationRepository,
        },
        presentation::dto::{
            request::RegisterRequest,
            response::{RegisterResponse, UserResponse},
        },
    },
    shared::{
        errors::app_error::AppError,
        security::{jwt, password::hash_password},
        state::app_state::AppState,
    },
};

fn generate_verification_code() -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    use std::time::{SystemTime, UNIX_EPOCH};

    let seed = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let mut hasher = DefaultHasher::new();
    seed.hash(&mut hasher);
    let hash = hasher.finish();

    const CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let mut code = String::with_capacity(6);
    let mut h = hash;
    for _ in 0..6 {
        code.push(CHARS[(h as usize) % CHARS.len()] as char);
        h /= CHARS.len() as u64;
    }
    code
}

fn map_role(request_role: Option<String>) -> &'static str {
    match request_role.as_deref() {
        Some("admin") => "admin",
        Some("gerente") => "gerente",
        _ => "cajero",
    }
}

pub struct RegistrationService;

impl RegistrationService {
    pub async fn register_user(
        state: &AppState,
        payload: RegisterRequest,
    ) -> Result<RegisterResponse, AppError> {
        // 1. Verificar email duplicado
        let user_repo = SqlxUserRepository::new(state.db.clone());
        let existing = user_repo.find_by_email(&payload.email).await?;
        if existing.is_some() {
            return Err(AppError::Conflict("Email already registered".to_string()));
        }

        let hashed_password: String = hash_password(&payload.password)?;

        let mut tx = state.db.begin().await?;

        // 2. Crear user (transaccional)
        let role = map_role(payload.role);
        let user: User = SqlxUserRepository::create(&mut tx, &payload.name, &payload.email, role)
            .await?;

        // 3. Crear account (transaccional)
        SqlxAccountRepository::create(&mut tx, &payload.email, &hashed_password, user.id).await?;

        // 4. Generar código de verificación
        let verification_code = generate_verification_code();
        SqlxVerificationRepository::create_tx(
            &mut tx,
            &payload.email,
            &verification_code,
            Utc::now() + chrono::Duration::minutes(15),
        )
        .await?;

        tracing::info!("Verification code for {}: {}", payload.email, verification_code);

        tx.commit().await?;

        // 5. Generar tokens JWT
        let token_pair = jwt::generate_tokens(
            &user.id.to_string(),
            &user.email,
            user.role.as_deref().unwrap_or("cajero"),
        )?;

        // 6. Crear session con refresh token
        let session_repo = SqlxSessionRepository::new(state.db.clone());
        session_repo
            .create(
                user.id,
                &token_pair.refresh_token,
                Utc::now() + chrono::Duration::days(7),
            )
            .await?;

        // 7. Armar response
        Ok(RegisterResponse {
            message: "User created successfully. Please verify your email.".to_string(),
            user: UserResponse::from(user),
            access_token: token_pair.access_token,
            refresh_token: token_pair.refresh_token,
        })
    }
}
