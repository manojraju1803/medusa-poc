#!/bin/bash
# First-boot setup for the demo EC2 (Amazon Linux 2023, arm64). No secrets here:
# they come from Secrets Manager when /opt/ib/deploy.sh runs.
set -euxo pipefail

# 2 GB swap so a memory spike doesn't OOM the 2 GB box
dd if=/dev/zero of=/swapfile bs=1M count=2048
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile swap swap defaults 0 0' >> /etc/fstab

dnf install -y docker nginx cronie jq
systemctl enable --now docker crond

# nginx: single site, proxies to the container. API Gateway terminates TLS, so
# set X-Forwarded-Proto here (Medusa trusts one proxy hop). Locked to 403 until
# deploy.sh writes the real origin check.
echo 'return 403;' > /etc/nginx/origin-check.conf
cat > /etc/nginx/nginx.conf <<'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /run/nginx.pid;
events { worker_connections 1024; }
http {
  access_log /var/log/nginx/access.log;
  server_tokens off;
  client_max_body_size 20m;
  add_header Strict-Transport-Security "max-age=31536000" always;
  add_header X-Frame-Options SAMEORIGIN always;
  add_header X-Content-Type-Options nosniff always;
  add_header Referrer-Policy strict-origin-when-cross-origin always;
  server {
    listen 80 default_server;
    # API Gateway adds x-origin-verify; anything else hitting port 80 gets 403.
    # The value is written by deploy.sh from Secrets Manager.
    include /etc/nginx/origin-check.conf;
    location / {
      proxy_pass http://127.0.0.1:9000;
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto https;
      proxy_read_timeout 60s;
    }
  }
}
EOF
systemctl enable --now nginx

mkdir -p /opt/ib
chmod 700 /opt/ib

# Non-secret settings. CORS values are filled in once the API Gateway and Vercel URLs exist.
cat > /opt/ib/app.env <<'EOF'
DATABASE_SSL=true
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=1024
STORE_CORS=http://localhost:8000
ADMIN_CORS=http://localhost:9000
AUTH_CORS=http://localhost:9000
EOF

# Deploy/redeploy: ./deploy.sh <tag>
cat > /opt/ib/deploy.sh <<'EOF'
#!/bin/bash
set -euo pipefail
TAG=${1:?usage: deploy.sh <tag>}
REGION=ap-south-1
REPO=626771561421.dkr.ecr.ap-south-1.amazonaws.com/ib-backend
umask 077
SECRET=$(aws secretsmanager get-secret-value --region $REGION --secret-id ib-demo/backend --query SecretString --output text)
echo "$SECRET" | jq -r 'del(.ORIGIN_SECRET) | to_entries[] | "\(.key)=\(.value)"' > /opt/ib/secrets.env
echo "if (\$http_x_origin_verify != \"$(echo "$SECRET" | jq -r .ORIGIN_SECRET)\") { return 403; }" > /etc/nginx/origin-check.conf
chmod 600 /etc/nginx/origin-check.conf
nginx -t -q && systemctl reload nginx
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin ${REPO%%/*} >/dev/null
docker pull $REPO:$TAG
docker rm -f ib-backend 2>/dev/null || true
docker run -d --name ib-backend --restart unless-stopped \
  --env-file /opt/ib/app.env --env-file /opt/ib/secrets.env \
  -p 127.0.0.1:9000:9000 --log-opt max-size=20m --log-opt max-file=3 \
  $REPO:$TAG
echo "deployed $TAG"
EOF
chmod 700 /opt/ib/deploy.sh

# Supabase free projects pause after 7 days idle; one DB-backed request a day
# keeps it awake. The publishable key is public (it ships in the storefront).
echo '30 3 * * * root curl -s -o /dev/null -H "x-publishable-api-key: PUBLISHABLE_KEY" http://127.0.0.1:9000/store/regions' > /etc/cron.d/ib-keepalive
