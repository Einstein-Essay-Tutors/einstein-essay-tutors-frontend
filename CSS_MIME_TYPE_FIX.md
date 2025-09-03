# CSS MIME Type Issue Fix

## Problem

CSS files are being served with MIME type `text/plain` instead of `text/css`, causing the browser to refuse to load them:

```
Refused to apply style from 'https://einsteinessaytutors.com/_next/static/css/cfaac8c8afe17e00.css'
because its MIME type ('text/plain') is not a supported stylesheet MIME type, and strict MIME checking is enabled.
```

## Root Cause

This is typically caused by:

1. **Nginx configuration** not properly handling CSS files from Next.js `_next/static/` directory
2. **Missing MIME type mapping** for `.css` files in nginx
3. **Incorrect proxy configuration** for static file serving

## Solution (Server-side fix required)

### Option 1: Update Nginx Configuration

SSH into the server and update the nginx configuration to properly handle CSS files:

```bash
# SSH into server
ssh newton@159.65.181.227

# Edit nginx configuration
sudo nano /etc/nginx/sites-available/default
```

Add or update the location block for static files:

```nginx
# Handle Next.js static files
location /_next/static/ {
    alias /var/www/essay-writing-tutors/frontend/.next/static/;
    expires 1y;
    add_header Cache-Control "public, immutable";

    # Ensure proper MIME types
    location ~* \.(css)$ {
        add_header Content-Type text/css;
    }

    location ~* \.(js)$ {
        add_header Content-Type application/javascript;
    }
}

# Ensure MIME types are included
include /etc/nginx/mime.types;
```

### Option 2: Verify MIME Types File

Ensure nginx has the correct MIME types configured:

```bash
# Check if mime.types includes CSS
grep -i css /etc/nginx/mime.types

# Should return something like:
# text/css css;
```

### Option 3: PM2/Next.js Static File Handling

If serving through PM2, ensure the Next.js app is properly handling static files:

```bash
# Check if .next directory has proper permissions
ls -la /var/www/essay-writing-tutors/frontend/.next/static/

# Ensure nginx user can read the files
sudo chown -R www-data:www-data /var/www/essay-writing-tutors/frontend/.next/
```

### Complete Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name einsteinessaytutors.com www.einsteinessaytutors.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name einsteinessaytutors.com www.einsteinessaytutors.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/einsteinessaytutors.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/einsteinessaytutors.com/privkey.pem;

    # Include MIME types
    include /etc/nginx/mime.types;

    # Next.js static files
    location /_next/static/ {
        alias /var/www/essay-writing-tutors/frontend/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # All other requests to Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Testing the Fix

After applying the fix:

1. **Restart Nginx**:

   ```bash
   sudo systemctl restart nginx
   ```

2. **Clear browser cache** and reload the page

3. **Check network tab** - CSS files should now load with `text/css` MIME type

4. **Verify static file serving**:

   ```bash
   curl -I https://einsteinessaytutors.com/_next/static/css/[filename].css
   ```

   Should return:

   ```
   Content-Type: text/css
   ```

## Required GitHub Secrets

For the fix to work, ensure these secrets are configured in the repository:

- `GOOGLE_OAUTH2_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_OAUTH2_CLIENT_SECRET` - Google OAuth client secret

## Status

- ✅ **Google OAuth configuration added** to backend CI/CD
- ✅ **GoogleOAuthProvider race condition fixed** in frontend
- ⚠️ **CSS MIME type issue** - requires server-side nginx configuration update

---

**Next Action**: SSH into server and update nginx configuration as described above.
