#include <stdio.h>
#include <sentry.h>

#ifndef ENV
#error "ENV Not Found"
#endif
#ifndef BUILD_HASH
#error "BUILD_HASH Not Found"
#endif


int main() {
    /* Setup Sentry First */
    sentry_options_t* SenOpt = sentry_options_new();
    sentry_options_set_dsn(SenOpt, "https://public:private@host:port/projectID");
    sentry_options_set_release(SenOpt, BUILD_HASH);
    sentry_options_set_environment(SenOpt, ENV);
    sentry_init(SenOpt);

    /* Run Codes Here */

    /* Cleanup when software is closed */
    sentry_close();

}