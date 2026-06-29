use std::net::{IpAddr, Ipv4Addr, SocketAddr};

use axum::{Router, routing::get};
use tokio::net::TcpListener;

const HOST: IpAddr = IpAddr::V4(Ipv4Addr::UNSPECIFIED);
const PORT: u16 = 4000;

#[tokio::main]
async fn main() {
    let addr: SocketAddr = SocketAddr::new(HOST, PORT);

    let router: Router = Router::new().route("/", get(|| async { "Hola mundo" }));

    let listener: TcpListener = TcpListener::bind(&addr).await.unwrap();

    println!("Servidor iniciado en http://{}", &addr);

    axum::serve(listener, router).await.unwrap()
}
