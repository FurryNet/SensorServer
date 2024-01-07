find_package(CURL REQUIRED)
find_package(PostgreSQL REQUIRED)

add_executable(SensorServer
	main.cpp
	webhook.cpp
	logger.cpp
	ConfigManager.cpp
)

target_link_libraries(SensorServer
	sentry
	CURL::libcurl
	PostgreSQL::PostgreSQL
)

if(DEFINED SENTRY_DSN)
	target_compile_definitions(SensorServer PRIVATE ENV="${ENV}" BUILD_HASH="${BUILD_HASH}" SENTRY_DSN="${SENTRY_DSN}")
endif()

install(TARGETS SensorServer DESTINATION bin)