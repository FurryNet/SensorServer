# !/bin/sh

# Standard Linux Build Script

mkdir build
cd build
cmake -DENV="${DOPPLER_ENVIRONMENT:-Development}" \
-DBUILD_HASH="${RAILWAY_GIT_COMMIT_SHA:-$(git rev-parse HEAD)}"
../
make -j$(nproc)
