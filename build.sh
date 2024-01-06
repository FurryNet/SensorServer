#!/bin/sh

# Standard Linux Build Script

mkdir build
cd build
cmake -DSENTRY_DSN="${SENTRY_DSN}" \
-DENV="${DOPPLER_ENVIRONMENT:-Development}" \
-DBUILD_HASH="${RAILWAY_GIT_COMMIT_SHA:-$(git rev-parse HEAD)}" \
../
make -j$(nproc)
# TODO: Add sentry-cli upload symbol
# Reminder, remove when see:
# ADD FOLLOWING LIBRARY: protobuf & MQTT & libpq++ (postgresql client)
# Maybe add if needed: json