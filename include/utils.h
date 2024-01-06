

/* Timestamped Logging Method */
enum logType {
	info,
	warning,
	error
};
void log(logType type, const char* message);