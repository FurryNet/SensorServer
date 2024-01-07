cmake_minimum_required(VERSION 3.16)
project(SensorServer)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Setup instsallation directories
if(CMAKE_INSTALL_PREFIX_INITIALIZED_TO_DEFAULT)
    set(CMAKE_INSTALL_PREFIX "${CMAKE_BINARY_DIR}/${CMAKE_BUILD_TYPE}" CACHE PATH "Default install path" FORCE)
    set(CMAKE_INSTALL_BINDIR ${CMAKE_INSTALL_PREFIX}/bin)
    set(CMAKE_INSTALL_LIBDIR ${CMAKE_INSTALL_PREFIX}/lib)
endif()
#set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
#set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)

# REMEMER TO REMOVE THIS WHEN DONE WITH DEVELOPMENT::
set(SENTRY_DSN "FakeDSN@example.com/111/111")
set(ENV "IDE_DEV")
set(BUILD_HASH "random_hash_value_placeholder")
set(PostgreSQL_ADDITIONAL_VERSIONS "16.1")
set(PostgreSQL_ROOT "E:/Program Files/PostgreSQL/16")

# Some variable checks
if(NOT DEFINED SENTRY_DSN)
    message(WARNING "Missing Sentry DSN, error capturing will be ignored!")
elseif(NOT DEFINED ENV)
    message(FATAL_ERROR "Missing ENV variable. Make sure you run the build script.")
elseif(NOT DEFINED BUILD_HASH)
    message(FATAL_ERROR "Missing BUILD_HASH. Make sure your're building it within git directory")
endif()

include_directories(include)
add_subdirectory(src)
add_subdirectory(lib)