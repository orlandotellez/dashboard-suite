use std::env;

use once_cell::sync::Lazy;

pub static DATABASE_URL: Lazy<String> =
    Lazy::new(|| env::var("DATABASE_URL").expect("DATABASE_URL not be defined"));

pub static FRONTEND_URL: Lazy<String> =
    Lazy::new(|| env::var("FRONTEND_URL").expect("FRONTEND_URL not be defined"));
