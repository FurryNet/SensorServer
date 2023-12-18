#!/bin/bash

if [ -z "$SENTRY_AUTH_TOKEN" ]; then
    echo "Missing Sentry Auth Token, skipping...";
    exit 0;
fi
if [ -z "$SENTRY_ORG" ]; then
    echo "Missing Sentry Organization, skipping...";
    exit 0;
fi
if [ -z "$SENTRY_PROJECT" ]; then
    echo "Missing Sentry Project, skipping...";
    exit 0;
fi

npx sentry-cli sourcemaps inject ./dist

if [ -z "$RAILWAY_GIT_COMMIT_SHA" ]; then
    echo "Warning: Git commit hash is missing, release identifier will not be included";
    npx sentry-cli sourcemaps upload ./dist
    exit 0;
fi

npx sentry-cli sourcemaps upload --release="$RAILWAY_GIT_COMMIT_SHA" ./dist