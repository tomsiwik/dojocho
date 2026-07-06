FROM node:24-bookworm-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates curl gettext-base procps \
 && rm -rf /var/lib/apt/lists/* \
 && corepack enable && corepack prepare pnpm@10.28.0 --activate
RUN npm install -g opencode-ai@latest \
                   @openai/codex@latest \
                   @google/gemini-cli@latest \
                   @earendil-works/pi-coding-agent@latest

COPY e2e/proxy /opt/dojocho/proxy
RUN cd /opt/dojocho/proxy && npm install --omit=dev --no-audit --no-fund

COPY e2e/.codex    /root/.codex
COPY e2e/.gemini   /root/.gemini
COPY e2e/.opencode /root/.opencode
COPY e2e/.pi       /root/.pi

WORKDIR /workspace
