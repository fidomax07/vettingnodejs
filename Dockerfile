FROM node:14-alpine as base-stage

ENV NODE_ENV=production
EXPOSE 3000

RUN apk add --no-cache tini
ENTRYPOINT ["tini", "--"]

RUN mkdir -p /app && chown -R node:node /app
WORKDIR /app

COPY package*.json ./

USER node
RUN npm config list
RUN npm ci && npm cache clean --force
ENV PATH=/app/node_modules/.bin:$PATH

COPY --chown=node:node . .


FROM base-stage as dev

ENV NODE_ENV=development

RUN npm config list
RUN npm install --only=development \
    && npm cache clean --force

CMD ["nodemon",  "./src/index.js"]


FROM dev as test

RUN eslint .

RUN npm audit

CMD ["npm", "run", "test"]


FROM base-stage as prod

CMD ["node", "./src/index.js"]
