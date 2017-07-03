FROM node:6.9.4
ENV APP_DIR /usr/src/app
RUN mkdir -p ${APP_DIR}
WORKDIR ${APP_DIR}

RUN rm /etc/localtime && \
    ln -s /usr/share/zoneinfo/Australia/Sydney/etc/localtime

COPY package.json ${APP_DIR}

RUN npm install -g babel-cli
RUN npm install

COPY . ${APP_DIR}

EXPOSE 3000
CMD [ "npm", "start" ]
