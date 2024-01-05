cmake_minimum_required(VERSION 3.16)
project(SensorServer VERSION 1.0.0)

set(CMAKE_INSTALL_PREFIX ${CMAKE_BINARY_DIR}/CMAKE_BUILD_TYPE/)

include_directories(include)
add_subdirectory(src)
add_subdirectory(lib)