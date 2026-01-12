location / {
    root /usr/share/nginx/html;
    index index.html index.htm;
    try_files $uri $uri/ /index.html =404;
}

location /api/ {
    proxy_pass http://backend:80/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-NginX-Proxy true;
}

location /admin/ {
    proxy_pass http://backend:80/admin/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-NginX-Proxy true;
}

location /static/ {
    alias /usr/src/app/simsy/staticfiles/;
    expires 30d;
    add_header Cache-Control "public";
}

location /media/ {
    alias /usr/src/data/media/;
    expires 7d; # Cache media files in browser for 7 days
    add_header Cache-Control "public";
}

location /films/ {
    alias /usr/src/data/films/;
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept';
    expires 7d;
    add_header Cache-Control "public";
}

location /series/ {
    alias /usr/src/data/series/;
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept';
    expires 7d;
    add_header Cache-Control "public";
}

location /captions/ {
    alias /usr/src/data/captions/;
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept';
    expires 7d;
    add_header Cache-Control "public";
}
