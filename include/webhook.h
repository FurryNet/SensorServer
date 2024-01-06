typedef struct {
	const char* url;
	const char** usersToPing;
	double temperature;
	double humidity;
} WebhookData_t;


void sendWebhook(WebhookData_t* data);