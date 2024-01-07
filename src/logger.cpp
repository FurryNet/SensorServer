#include <logger.h>
#include <stdio.h>
#include <time.h>
#include <stdarg.h>

// Console output with timestamp
void log(logType type, const char* message, ...) {
	// UTC Format: DD/MM/YYYY HH:MM:SS
	time_t now = time(0);
	tm* ltm = localtime(&now);
	char timeStr[20];
	sprintf(timeStr, "%02d/%02d/%04d %02d:%02d:%02d", ltm->tm_mday, ltm->tm_mon, ltm->tm_year, ltm->tm_hour, ltm->tm_min, ltm->tm_sec);

	// Allow message to be formatted with printf style
	char finalMsg[1024];
	va_list args;
	va_start(args, message);
	vsprintf(finalMsg, message, args);
	va_end(args);
	
	switch (type) {
		case info:
			printf("\033[0;37m[%s] %s\033[0m\n", timeStr, finalMsg);
			break;
		case warning:
			printf("\033[0;33m[%s] %s\033[0m\n", timeStr, finalMsg);
			break;
		case error:
			printf("\033[0;31m[%s] %s\033[0m\n", timeStr, finalMsg);
			break;
	}
}