#include <stdio.h>
#include <stdlib.h>
#include <config.h>

int readConfig(config_t* config, const char* path) {
    FILE *fp = fopen(path, "r");
    if(fp == NULL)
        return -1;
    
    // Start by reading the config line by line
    char* line = NULL;
    size_t len = 0;
    ssize_t
}

void freeConfig(config_t* config) {
    free(config->cron.time);
    free(config->cron.sentrySlug);
    for (int i = 0; i < config->cron.usersToPingSize; i++)
        free(config->cron.usersToPing[i]);
    free(config->cron.usersToPing);
}