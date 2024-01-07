

/* Timestamped Logging Method */
enum logType {
	info,
	warning,
	error
};
// Log message to console with timestamp. Message can be formatted with printf style.
void log(logType type, const char* message, ...);