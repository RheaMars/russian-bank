FROM centos:latest
MAINTAINER theyellow

RUN yum -y install httpd
RUN yum -y install nodejs
RUN yum -y install npm

ADD . /var/www/html/

WORKDIR /var/www/html

RUN npm install
RUN npm install --global webpack
RUN npm install --global webpack-cli

RUN webpack

CMD ["/usr/sbin/httpd", "-D", "FOREGROUND"]

EXPOSE 80
