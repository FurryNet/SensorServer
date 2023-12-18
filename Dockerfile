# Setup build image
FROM node:20-buster-slim as buildenv
WORKDIR /source/
RUN npm install -g npm@latest

# Install npm packages
COPY package.json package-lock.json ./
RUN npm install

# Copy all build files and build
COPY tsconfig.json prisma/ ./
COPY scripts/ ./scripts
RUN chmod +x ./scripts/*
COPY src/ ./src/
RUN npx prisma generate
RUN npm run build

# Run some sentry sourcemap deployment
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_ORG
ARG SENTRY_PROJECT
RUN scripts/sentryDeploy.sh

# Perform postbuild cleanup for production
RUN npm prune --production



# Setup production image
FROM node:20-alpine

# Setup the environment?
WORKDIR /app/

# Install/upgrade some system packages
RUN npm install -g npm@latest

# Copy files from the build env
COPY --from=buildenv /source/dist /app/
COPY --from=buildenv /source/node_modules /app/node_modules/

# Sleep is specifically for railway internal network wait time
CMD sleep 300 && node index.js