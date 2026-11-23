#[cfg(feature = "ssr")]
#[tokio::main]
async fn main() {
    lab::server::run().await;
}

#[cfg(not(feature = "ssr"))]
pub fn main() {}
