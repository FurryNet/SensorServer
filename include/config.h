
typedef struct {
	char* time;
	char** usersToPing;
	size_t usersToPingSize;
	char* sentrySlug;
} cron_config_t;
typedef struct {
	cron_config_t cron;
} config_t;

/*
Read the config file by passing config_t ref and path to config file
Returns -1 if file not found, 0 if successful
*/
int readConfig(config_t* config, const char* path);

// Because of how the config is structured, we need to free the heap
void freeConfig(config_t* config);