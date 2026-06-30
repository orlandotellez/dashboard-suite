use axum::{Router, middleware, routing::post};

use crate::{
    features::auth::presentation::handlers::{login_handler, refresh_handler, registration_handler},
    shared::{security::auth_guard, state::app_state::AppState},
};

pub fn routes() -> Router<AppState> {
    let public_routes = Router::new()
        .route("/login", post(login_handler::login_user))
        .route("/refresh", post(refresh_handler::refresh_token));

    let protected_routes = Router::new()
        .route("/register", post(registration_handler::register_user))
        .route_layer(middleware::from_fn(auth_guard::admin_middleware));

    public_routes.merge(protected_routes)
}
