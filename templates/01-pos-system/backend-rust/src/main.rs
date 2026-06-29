pub mod database;
pub mod shared;

use std::net::{IpAddr, Ipv4Addr, SocketAddr};

use axum::{Router, routing::get};
use dotenvy::dotenv;
use sqlx::{Pool, Postgres};
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;

use crate::database::connection::create_pool;

const HOST: IpAddr = IpAddr::V4(Ipv4Addr::UNSPECIFIED);
const PORT: u16 = 4000;

#[tokio::main]
async fn main() {
    dotenv().ok();

    shared::config::logger::init();

    let cors: CorsLayer = shared::config::cors::init();

    let addr: SocketAddr = SocketAddr::new(HOST, PORT);

    let db: Pool<Postgres> = create_pool().await.expect("Error connect database");

    let router: Router = Router::new()
        .route("/", get(|| async { "Hola mundo" }))
        .with_state(db)
        .layer(cors);

    let listener: TcpListener = TcpListener::bind(&addr).await.unwrap();

    tracing::info!("Server listen on http://{}", &addr);

    axum::serve(listener, router).await.unwrap()
}
