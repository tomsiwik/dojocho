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

COPY packages/cli    /tmp/dojocho-cli
COPY packages/config /tmp/dojocho-config
RUN cd /tmp/dojocho-config && npm install --omit=dev --no-audit --no-fund \
 && sed -i 's|"workspace:\*"|"file:/tmp/dojocho-config"|g' /tmp/dojocho-cli/package.json \
 && cd /tmp/dojocho-cli && npm install --omit=dev --no-audit --no-fund \
 && npm install -g /tmp/dojocho-cli --force \
 && dojo --help | head -1

RUN mv /usr/local/bin/npm /usr/local/bin/npm-real \
 && cat > /usr/local/bin/npm <<'NPM' && chmod +x /usr/local/bin/npm
#!/bin/sh
case " $* " in
  *" dojocho "*|*" dojocho@"*)
    echo "added 1 package, and audited 1 package in 1s"
    echo "found 0 vulnerabilities"
    exit 0
    ;;
esac
exec /usr/local/bin/npm-real "$@"
NPM

WORKDIR /workspace
