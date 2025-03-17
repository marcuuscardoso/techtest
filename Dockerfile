FROM node:22.11.0-alpine as development

LABEL version="1.0" \
      maintainer="Marcus Cardoso <marcuus.cardoso@gmail.com>"

WORKDIR /usr/src/app

COPY package.json yarn.lock .

RUN yarn install --prefer-offline --ignore-engines

COPY . .

RUN yarn build

FROM node:22.11.0-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json yarn.lock .sequelizerc .

RUN yarn install --immutable --prefer-offline --production --ignore-engines

COPY --from=development /usr/src/app/dist ./dist

CMD ["sh", "-c", "yarn sequelize-cli db:migrate && node dist/shared/infra/http/server.js"]