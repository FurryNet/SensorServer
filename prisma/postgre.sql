CREATE TABLE sensor_records (
    id SERIAL PRIMARY KEY,
    temperature NUMERIC(5,2) NOT NULL,
    humidity NUMERIC(5,2) NOT NULL,
    /* We won't use default value since this data must come from the sensor for accuracy (otherwise the time would offset by network and db query latency) */
    created_at TIMESTAMP NOT NULL,
    /* this is used for internal reference in-case multiple locations are involved */
    location_name TEXT
);
