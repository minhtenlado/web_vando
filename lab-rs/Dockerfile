# syntax=docker/dockerfile:1.7
#
# Production image for the Rust site (Axum server + Leptos WASM islands).
#   docker build -t phanhuynh-lab lab-rs
#   docker run --env-file .env -p 8080:8080 phanhuynh-lab
#
# Runtime environment (same names as the Next.js app):
#   DATABASE_URL, SESSION_SECRET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
#   optional: WEB3FORMS_ACCESS_KEY, GITHUB_TOKEN, ADMIN_PASSWORD (fallback only when no hash is stored)

FROM rust:1.100-bookworm AS build
RUN rustup target add wasm32-unknown-unknown \
 && cargo install cargo-leptos --version 0.3.11 --locked
WORKDIR /src
COPY . .
RUN cargo leptos build --release --split \
 && strip target/release/lab

FROM debian:bookworm-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl \
 && rm -rf /var/lib/apt/lists/* \
 && useradd --system --uid 10001 --no-create-home lab
WORKDIR /app
COPY --from=build /src/target/release/lab /app/lab
COPY --from=build /src/target/site /app/site
ENV LEPTOS_SITE_ROOT=/app/site \
    LEPTOS_SITE_PKG_DIR=pkg \
    LEPTOS_ENV=PROD \
    PORT=8080 \
    RUST_LOG=info
USER lab
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD curl -fsS http://127.0.0.1:8080/api/health || exit 1
CMD ["/app/lab"]
