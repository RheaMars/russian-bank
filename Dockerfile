FROM oraclelinux:8
MAINTAINER theyellow

RUN dnf -y install httpd
RUN dnf -y install nodejs
RUN dnf -y install npm

ADD . /var/www/html/

WORKDIR /var/www/html

RUN npm install
RUN npm install --global webpack
RUN npm install --global webpack-cli

RUN webpack

CMD ["/usr/sbin/httpd", "-D", "FOREGROUND"]

EXPOSE 80
