#find_package(CURL REQUIRED) // Windows development suck ass. Using submodule for the sake of that.
add_executable(SensorServer
	main.cpp
	webhook.cpp
	utils.cpp
	ConfigManager.cpp
	)
target_link_libraries(SensorServer sentry CURL::libcurl)

if(DEFINED SENTRY_DSN)
	target_compile_definitions(SensorServer PRIVATE ENV="${ENV}" BUILD_HASH="${BUILD_HASH}" SENTRY_DSN="${SENTRY_DSN}")
endif()