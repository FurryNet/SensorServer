#include <webhook.h>
#include <curl/curl.h>


void sendWebhook(WebhookData_t* data) {
	CURL* curl;
	CURLcode res;
	curl = curl_easy_init();
	if (curl) {
		curl_easy_setopt(curl, CURLOPT_URL, data->url);
		curl_easy_setopt(curl, CURLOPT_POST, 1L);
		//@TODO Add header type, prefer x-www-form-urlencoded to avoid extra json parsing and loading the content
		res = curl_easy_perform(curl);
		if (res != CURLE_OK) {
			fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
		}
		curl_easy_cleanup(curl);
	}
	curl_global_cleanup();
}