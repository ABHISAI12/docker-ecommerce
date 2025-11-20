FROM nginx:1.25-alpine

# Copy our static HTML/JS files into the Nginx server's web root
COPY ./src /usr/share/nginx/html

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf