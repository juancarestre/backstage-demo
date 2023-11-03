# Stage 1 - Create yarn install skeleton layer
FROM node:18-bullseye-slim AS packages

WORKDIR /app
COPY package.json yarn.lock ./

COPY packages packages
COPY examples examples
# Comment this out if you don't have any internal plugins
# COPY plugins plugins

RUN find packages \! -name "package.json" -mindepth 2 -maxdepth 2 -exec rm -rf {} \+

# Stage 2 - Install dependencies and build packages
FROM node:18-bullseye-slim AS build

WORKDIR /app
COPY --from=packages /app .

RUN apt-get update \
    && apt-get install -y python3 python3-pip make g++ \
    && pip3 install mkdocs-techdocs-core==1.1.7

RUN yarn install --frozen-lockfile --network-timeout 600000 && rm -rf "$(yarn cache dir)"

COPY . .

RUN yarn tsc

ARG BASE_URL

RUN yarn --cwd packages/backend build
# If you have not yet migrated to package roles, use the following command instead:
# RUN yarn --cwd packages/backend backstage-cli backend:bundle --build-dependencies

# Stage 3 - Build the actual backend image and install production dependencies
FROM node:18-bullseye-slim

WORKDIR /app
ARG BASE_URL

RUN apt-get update \
    && apt-get install -y procps \
    && apt-get install -y curl \
    && apt-get install -y psmisc \
    && apt-get install -y git
RUN apt-get install -y python3 python3-pip

RUN pip3 install mkdocs-techdocs-core==1.1.7


#this
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && \
    apt-get install -y --no-install-recommends python3 build-essential && \
    yarn config set python /usr/bin/python3

RUN apt-get update && apt-get install -y python3 make g++

RUN yarn global add node-gyp

# Copy the install dependencies from the build stage and context
COPY --from=build /app/yarn.lock /app/package.json /app/packages/backend/dist/skeleton.tar.gz ./
RUN tar xzf skeleton.tar.gz && rm skeleton.tar.gz

RUN yarn install --frozen-lockfile --production --network-timeout 600000 && rm -rf "$(yarn cache dir)"

# Copy the built packages from the build stage
COPY --from=build /app/packages/backend/dist/bundle.tar.gz .
RUN tar xzf bundle.tar.gz && rm bundle.tar.gz

# Copy any other files that we need at runtime
COPY app-config.production.yaml ./app-config.yaml
COPY examples /app/
# CMD ["node", "packages/backend", "--config", "app-config.yaml"]