# Municipal On-Premises & Cloud Deployment Guide
### Sovereign Infrastructure Setup for Woreda & Sub-City Centers

---

## 1. System Requirements

* **Operating System**: Ubuntu 22.04 LTS / Debian 12 / Rocky Linux 9 / Windows Server 2022
* **CPU**: 2 vCPUs minimum (4 vCPUs recommended for >20 concurrent counters)
* **RAM**: 4 GB minimum (8 GB recommended)
* **Storage**: 20 GB SSD (SQLite WAL journal mode requires low-latency disk I/O)
* **Network**: Local Ethernet/Wi-Fi subnet with static IP assignment for municipal desk stands

---

## 2. Bare-Metal Linux Deployment (Systemd + Nginx)

### A. Clone & Install
```bash
cd /opt
sudo git clone https://github.com/Yohanneswz/charter-mark-kpi.git
cd charter-mark-kpi
sudo npm install
sudo npm run build
```

### B. Configure Systemd Service
Create `/etc/systemd/system/charter-mark.service`:
```ini
[Unit]
Description=FDRE Charter Mark KPI Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/charter-mark-kpi
ExecStart=/usr/bin/npx tsx server/server.ts
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now charter-mark
```

---

## 3. Nginx Reverse Proxy Configuration

Create `/etc/nginx/sites-available/charter-mark`:
```nginx
server {
    listen 80;
    server_name kpi.bole.gov.et 192.168.1.2;

    # Static Frontend Assets
    location / {
        root /opt/charter-mark-kpi/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $remote_addr;
    }
}
```

Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/charter-mark /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

---

## 4. Backup & Disaster Recovery

The SQLite database operates in write-ahead logging (WAL) mode. To create a hot backup without stopping service:
```bash
# Atomic online backup using SQLite backup API
sqlite3 /opt/charter-mark-kpi/data/charter_mark.db ".backup /var/backups/charter_mark_$(date +%F).db"
```
