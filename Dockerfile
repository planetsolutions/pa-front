FROM httpd:2.4
RUN	mkdir /usr/local/apache2/htdocs/pgu/
COPY /dist/* /usr/local/apache2/htdocs/pgu/