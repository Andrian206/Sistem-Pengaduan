# ================================
# Stage 1: Dependencies
# ================================
FROM node:20-slim AS deps

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json* ./

# Install dependencies
# Gunakan cache mount untuk mempercepat build selanjutnya
# Tambahkan --verbose agar terlihat progress-nya (tidak dikira hang)
RUN --mount=type=cache,target=/root/.npm \
    npm ci --include=dev --no-audit --verbose

# ================================
# Stage 2: Builder
# ================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies dari stage sebelumnya
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env (wajib diisi saat build)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}

# Fail cepat kalau env belum diset agar error lebih jelas
RUN test -n "$NEXT_PUBLIC_SUPABASE_URL" && test -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
	|| (echo "Missing Supabase env. Set build-arg NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY" && exit 1)

# Set environment untuk production build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js app
RUN npm run build

# ================================
# Stage 3: Runner (Production)
# ================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Buat user non-root untuk security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy files yang diperlukan saja
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set ownership
RUN chown -R nextjs:nodejs /app

# Switch ke non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set hostname
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Run app dengan standalone server
CMD ["node", "server.js"]
