# LiteSpeed Configuration Fix

## Problem
- Site returning 404 errors despite healthy Docker containers
- LiteSpeed not proxying requests to Docker containers on ports 8080 (frontend) and 3001 (backend)

## Root Cause
LiteSpeed proxy contexts were missing required `handler` directives, causing configuration validation errors.

## Solution

### 1. Set docRoot (Required)
LiteSpeed requires a `docRoot` even for proxy-only configurations:
```bash
# Uncomment and set docRoot to dummy path
sed -i 's/#docRoot \$VH_ROOT\/public_html/docRoot \/tmp\/empty/' /usr/local/lsws/conf/vhosts/gazatrust.me/vhost.conf

# Create the dummy directory
mkdir -p /tmp/empty
```

### 2. Add Missing Handlers
Each proxy context needs a `handler` directive pointing to the external processor:

```bash
# Add handler for root context (frontend)
sed -i 's/context \/ {/context \/ {\n  handler                 webserver_8080/' /usr/local/lsws/conf/vhosts/gazatrust.me/vhost.conf

# Add handler for API context (backend)
sed -i 's/context \/api {/context \/api {\n  handler                 webserver_3001/' /usr/local/lsws/conf/vhosts/gazatrust.me/vhost.conf

# Add handler for health context (backend)
sed -i 's/context \/health {/context \/health {\n  handler                 webserver_3001/' /usr/local/lsws/conf/vhosts/gazatrust.me/vhost.conf
```

### 3. Restart LiteSpeed
```bash
systemctl restart lsws
```

## Final Working Configuration

The contexts now properly reference the external processors:

```
context / {
  handler                 webserver_8080
  type                    proxy
  uri                     http://127.0.0.1:8080/
  extraHeaders            Host $host
  order                   1
}

context /api {
  handler                 webserver_3001
  type                    proxy
  uri                     http://127.0.0.1:3001/
  extraHeaders            Host $host
  order                   2
}

context /health {
  handler                 webserver_3001
  type                    proxy
  uri                     http://127.0.0.1:3001/health
  extraHeaders            Host $host
  order                   3
}
```

## Key Learnings
1. **docRoot is mandatory** - Even proxy-only vhosts need a docRoot defined
2. **Handlers are required** - Proxy contexts need both `uri` and `handler` directives
3. **External processors must be defined** - The `webserver_8080` and `webserver_3001` processors were already correctly configured
4. **Configuration validation** - Use `/usr/local/lsws/bin/lshttpd -t` to check for errors

## Verification
```bash
# Test frontend
curl -v http://gazatrust.me/

# Test backend API
curl -v http://gazatrust.me/api/health
```

Both should return 200 OK responses from the Docker containers.