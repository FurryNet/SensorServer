CREATE TABLE temp_records (
    id SERIAL PRIMARY KEY,
    temperature DECIMAL(5,2) NOT NULL,
    humidity DECIMAL(5,2) NOT NULL,
    /* We won't use default value since this data must come from the sensor for accuracy (otherwise the time would offset by network and db query latency) */
    record_ts TIMESTAMP NOT NULL,
    /* this is used for internal reference in-case multiple locations are involved */
    location_name TEXT
);
