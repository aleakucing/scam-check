FROM oven/bun:1-slim

WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency specifications and install
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile || bun install

# Copy source code
COPY . .

# Ensure data directory exists for SQLite database vault
RUN mkdir -p /app/data

EXPOSE 8000
ENV PORT=8000
ENV HOST=0.0.0.0

CMD ["bun", "run", "src/index.ts"]
