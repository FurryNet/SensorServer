#include <stdio.h>
#include <sentry.h>

#if defined(SENTRY_DSN) && !defined(ENV)
#error "ENV Not Found"
#endif
#if defined(SENTRY_DSN) && !defined(BUILD_HASH)
#error "BUILD_HASH Not Found"
#endif


int main() {
    /* Setup Sentry First */
#ifdef SENTRY_DSN
    sentry_options_t* SenOpt = sentry_options_new();
    sentry_options_set_dsn(SenOpt, SENTRY_DSN);
    sentry_options_set_release(SenOpt, BUILD_HASH);
    sentry_options_set_environment(SenOpt, ENV);
    sentry_init(SenOpt);
#endif
#if defined(BUILD_HASH)
    printf("Software Loaded. Version: %s", BUILD_HASH);
#else
    printf("Software Loaded. Version: Unknown");
#endif

    /* Run Codes Here */

    /* Cleanup when software is closed */
    sentry_close();

}