FROM nginx
RUN mkdir /usr/share/nginx/html/pgu
COPY dist /usr/share/nginx/html/pgu