#include <stdio.h>
#include <stdlib.h>
#include <config.h>
#include <string.h>
#include <cerrno>
#include <ctype.h>

ssize_t getline(char **lineptr, size_t *n, FILE *stream);
void trimWhitespace(char* str);

int readConfig(config_t* config, const char* path) {
    FILE *fp = fopen(path, "r");
    if(fp == NULL)
        return -1;
    
    // Start by reading the config line by line
    char* line = NULL;
    size_t len = 0;
    long long read;
    while((read = getline(&line, &len, fp)) != -1) {
        // Ignore comments
        if(line[0] == '#')
            continue;
        
        // Split the line into key and value
        char* key = strtok(line, "=");
        char* value = strtok(NULL, "=");
        if(key == NULL || value == NULL)
            continue;
        
        // Remove trailing newline
        value[strcspn(value, "\n")] = 0;

        // Trim any spaces around the key and value
        trimWhitespace(key);
        trimWhitespace(value);
        
        // Start Parsing the config
        if(strcmp(key, "cron_time") == 0) {
            config->cron.time = (char*)malloc(strlen(value) + 1);
            strcpy(config->cron.time, value);
        } else if(strcmp(key, "cron_sentrySlug") == 0) {
            config->cron.sentrySlug = (char*)malloc(strlen(value) + 1);
            strcpy(config->cron.sentrySlug, value);
        } else if(strcmp(key, "cron_usersPing") == 0) {
            // Count the number of users to ping
            int count = 0;
            for(int i = 0; i < strlen(value); i++)
                if(value[i] == ',')
                    count++;
            count++;

            // Allocate the array
            config->cron.usersToPing = (char**)malloc(count * sizeof(char*));
            config->cron.usersToPingSize = count;

            // Copy the users to ping
            char* user = strtok(value, ",");
            for(int i = 0; i < count; i++) {
                config->cron.usersToPing[i] = (char*)malloc(strlen(user) + 1);
                strcpy(config->cron.usersToPing[i], user);
                user = strtok(NULL, ",");
            }
        }
    }
}

void freeConfig(config_t* config) {
    free(config->cron.time);
    free(config->cron.sentrySlug);
    for (int i = 0; i < config->cron.usersToPingSize; i++)
        free(config->cron.usersToPing[i]);
    free(config->cron.usersToPing);
}


// Readline Implementation
ssize_t getline(char **lineptr, size_t *n, FILE *stream) {
    size_t pos;
    int c;

    if (lineptr == NULL || stream == NULL || n == NULL) {
        errno = EINVAL;
        return -1;
    }

    c = getc(stream);
    if (c == EOF) {
        return -1;
    }

    if (*lineptr == NULL) {
        *lineptr = (char*)malloc(128);
        if (*lineptr == NULL) {
            return -1;
        }
        *n = 128;
    }

    pos = 0;
    while(c != EOF) {
        if (pos + 1 >= *n) {
            size_t new_size = *n + (*n >> 2);
            if (new_size < 128) {
                new_size = 128;
            }
            char *new_ptr = (char*)realloc(*lineptr, new_size);
            if (new_ptr == NULL) {
                return -1;
            }
            *n = new_size;
            *lineptr = new_ptr;
        }

        ((unsigned char *)(*lineptr))[pos ++] = c;
        if (c == '\n') {
            break;
        }
        c = getc(stream);
    }

    (*lineptr)[pos] = '\0';
    return pos;
}

// Trim both leading and trailing whitespace
void trimWhitespace(char* str) {
    if (str == NULL || *str == '\0')
        return;
    
    // Trim leading whitespace
    char *start = str;
    while (isspace(*start))
        start++;

    // Trim trailing whitespace
    char *end = str + strlen(str) - 1;
    while (end > start && isspace(*end))
        --end;
    *(end + 1) = '\0'; // Null-terminate the trimmed string

    // Shift the trimmed string to the beginning
    if (start != str)
        memmove(str, start, end - start + 2);
}