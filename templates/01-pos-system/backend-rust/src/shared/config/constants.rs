use std::env;

use once_cell::sync::Lazy;

pub static DATABASE_URL: Lazy<String> =
    Lazy::new(|| env::var("DATABASE_URL").expect("DATABASE_URL not be defined"));
