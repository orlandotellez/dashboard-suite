use axum::{Json, extract::State, http::StatusCode};
use axum_extra::extract::CookieJar;

use crate::{
    features::auth::{
        application::authentication_service::AuthenticationService,
        presentation::dto::{request::RefreshRequest, response::RegisterResponse},
    },
    shared::{
        errors::app_error::AppError, security::cookies::set_auth_cookies,
        state::app_state::AppState,
    },
};

pub async fn refresh_token(
    State(state): State<AppState>,
    jar: CookieJar,
    Json(payload): Json<RefreshRequest>,
) -> Result<(StatusCode, CookieJar, Json<RegisterResponse>), AppError> {
    let refresh_token: String = payload
        .refresh_token
        .ok_or_else(|| AppError::BadRequest("Refresh token required".to_string()))?;

    let response: RegisterResponse = AuthenticationService::refresh(&state, &refresh_token).await?;

    let jar: CookieJar = set_auth_cookies(jar, &response.access_token, &response.refresh_token);

    Ok((StatusCode::OK, jar, Json(response)))
}
