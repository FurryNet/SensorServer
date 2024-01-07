#include <utils.h>
#include <stdio.h>
#include <time.h>

// Console output with timestamp
void log(logType type, const char* message) {
	time_t now = time(0);
	tm* ltm = localtime(&now);
	// UTC Format: DD/MM/YYYY HH:MM:SS
	char timeStr[20] = { 0 };
	sprintf(timeStr, "%02d/%02d/%04d %02d:%02d:%02d", ltm->tm_mday, ltm->tm_mon, ltm->tm_year, ltm->tm_hour, ltm->tm_min, ltm->tm_sec);
	switch (type) {
		case info:
			printf("\033[0;37m[%s] %s\033[0m\n", timeStr, message);
			break;
		case warning:
			printf("\033[0;33m[%s] %s\033[0m\n", timeStr, message);
			break;
		case error:
			printf("\033[0;31m[%s] %s\033[0m\n", timeStr, message);
			break;
	}
}