# Create Stream Snowflake Based On Table
CREATE OR REPLACE STREAM SNOWFLAKE_LANDING_DB.DEV.STR_TBLSAM_PERIODE_MINGGU_LANDING ON TABLE SNOWFLAKE_LANDING_DB.DEV.TBLSAM_PERIODE_MINGGU_LANDING APPEND_ONLY = FALSE;

# Create View Snowflake
CREATE OR REPLACE VIEW SNOWFLAKE_LANDING_DB.DEV.VW_TBLSAM_PERIODE_MINGGU_CDC AS
WITH events AS (
SELECT
PAYLOAD:op::string AS op,
PAYLOAD:before:periode_minggu_id::number AS before_id,
PAYLOAD:after:periode_minggu_id::number AS after_id,
COALESCE(
PAYLOAD:after:periode_minggu_id::number,
PAYLOAD:before:periode_minggu_id::number
) AS id_key,

    /* Nilai akhir per kolom: after untuk c/u, before untuk d */
    CASE WHEN PAYLOAD:op::string='d'
         THEN PAYLOAD:before:periode_minggu_id::number
         ELSE PAYLOAD:after:periode_minggu_id::number
    END                                                        AS periode_minggu_id,
    CASE WHEN op='d' THEN PAYLOAD:before:periode_minggu_key::string
                      ELSE PAYLOAD:after:periode_minggu_key::string
    END                                                        AS periode_minggu_key,
    CASE WHEN op='d' THEN PAYLOAD:before:tahun::string
                      ELSE PAYLOAD:after:tahun::string
    END                                                        AS tahun,
    CASE WHEN op='d' THEN PAYLOAD:before:minggu::float
                      ELSE PAYLOAD:after:minggu::float
    END                                                        AS minggu,
    CASE WHEN op='d'
         THEN DATEADD('day', TO_NUMBER(PAYLOAD:before:start_date::string), DATE '1970-01-01')
         ELSE DATEADD('day', TO_NUMBER(PAYLOAD:after:start_date::string),  DATE '1970-01-01')
    END                                                        AS start_date,
    CASE WHEN op='d'
         THEN DATEADD('day', TO_NUMBER(PAYLOAD:before:end_date::string), DATE '1970-01-01')
         ELSE DATEADD('day', TO_NUMBER(PAYLOAD:after:end_date::string),  DATE '1970-01-01')
    END                                                        AS end_date,
    CASE WHEN op='d' THEN PAYLOAD:before:is_valid::boolean
                      ELSE PAYLOAD:after:is_valid::boolean
    END                                                        AS is_valid,
    CASE WHEN op='d' THEN PAYLOAD:before:is_valid_old::boolean
                      ELSE PAYLOAD:after:is_valid_old::boolean
    END                                                        AS is_valid_old,
    CASE WHEN op='d' THEN PAYLOAD:before:is_active::boolean
                      ELSE PAYLOAD:after:is_active::boolean
    END                                                        AS is_active,
    CASE WHEN op='d' THEN TO_TIMESTAMP_NTZ(TO_NUMBER(PAYLOAD:before:created::string)/1000)
                      ELSE TO_TIMESTAMP_NTZ(TO_NUMBER(PAYLOAD:after:created::string)/1000)
    END                                                        AS created,
    CASE WHEN op='d' THEN PAYLOAD:before:created_by::string
                      ELSE PAYLOAD:after:created_by::string
    END                                                        AS created_by,
    CASE WHEN op='d' THEN TO_TIMESTAMP_NTZ(TO_NUMBER(PAYLOAD:before:last_modified::string)/1000)
                      ELSE TO_TIMESTAMP_NTZ(TO_NUMBER(PAYLOAD:after:last_modified::string)/1000)
    END                                                        AS last_modified,
    CASE WHEN op='d' THEN PAYLOAD:before:last_modified_by::string
                      ELSE PAYLOAD:after:last_modified_by::string
    END                                                        AS last_modified_by,
    CASE WHEN op='d' THEN TO_TIMESTAMP_NTZ(TO_NUMBER(PAYLOAD:before:sync_timestamp::string)/1000)
                      ELSE TO_TIMESTAMP_NTZ(TO_NUMBER(PAYLOAD:after:sync_timestamp::string)/1000)
    END                                                        AS sync_timestamp,
    CASE WHEN op='d' THEN PAYLOAD:before:bulan::smallint
                      ELSE PAYLOAD:after:bulan::smallint
    END                                                        AS bulan,

    (op='d')                                                   AS is_deleted,

    /* Urutan event yang stabil */
    TO_TIMESTAMP_NTZ(TO_NUMBER(RECORD_METADATA:CreateTime::string)/1000) AS creation_time,
    RECORD_METADATA:partition::number                                    AS kafka_partition,
    TO_NUMBER(RECORD_METADATA:offset::string)                            AS kafka_offset

FROM SNOWFLAKE_LANDING_DB.DEV.STR_TBLSAM_PERIODE_MINGGU_LANDING
WHERE PAYLOAD IS NOT NULL
)
SELECT
op, id_key,
periode_minggu_id, periode_minggu_key, tahun, minggu, start_date, end_date,
is_valid, is_valid_old, is_active,
created, created_by, last_modified, last_modified_by, sync_timestamp, bulan,
is_deleted,
creation_time
FROM events
WHERE CREATION_TIME >= DATE_TRUNC('DAY', CURRENT_TIMESTAMP())
QUALIFY ROW_NUMBER() OVER (
PARTITION BY id_key
ORDER BY creation_time DESC, kafka_partition DESC, kafka_offset DESC
) = 1;

# Create Task For Merge
create or replace task SNOWFLAKE_LANDING_DB.DEV.TASK_TBLSVAPRX_SURVEY_QUESTION_ANSWER_CDC
warehouse=WH_TASKS_XS
SCHEDULE = 'USING CRON 0 0 \* \* _ Asia/Jakarta'
when SYSTEM$STREAM_HAS_DATA('SNOWFLAKE_LANDING_DB.DEV.STR_TBLMDM_AREA_LANDING')
as BEGIN
-- Merge Table
MERGE INTO DEV_SNOWFLAKE_DB.BRONZE.TBLSVAPRX_SURVEY_QUESTION_ANSWER T
USING (
SELECT _ FROM SNOWFLAKE_LANDING_DB.DEV.VW_TBLSVAPRX_SURVEY_QUESTION_ANSWER_CDC
WHERE OP IN ('c','u','d')
) S
ON T.survey_question_answer_id = S.ID_KEY
WHEN MATCHED AND S.OP = 'd' THEN
DELETE
WHEN MATCHED AND S.OP IN ('u') THEN
UPDATE SET
SURVEY_QUESTION_ANSWER_KEY = S.SURVEY_QUESTION_ANSWER_KEY,
SURVEY_QUESTION_ID = S.SURVEY_QUESTION_ID,
SURVEY_ANSWER_ID = S.SURVEY_ANSWER_ID,
ANSWER_VALUE = S.ANSWER_VALUE,
IS_ACTIVE = S.IS_ACTIVE,
CREATED = S.CREATED,
CREATED_BY = S.CREATED_BY,
LAST_MODIFIED = S.LAST_MODIFIED,
LAST_MODIFIED_BY = S.LAST_MODIFIED_BY,
SYNC_TIMESTAMP = S.SYNC_TIMESTAMP
WHEN NOT MATCHED AND S.OP IN ('c') THEN
INSERT (
survey_question_answer_id ,
survey_question_answer_key ,
survey_question_id ,
survey_answer_id ,
answer_value ,
is_active ,
created ,
created_by ,
last_modified ,
last_modified_by ,
sync_timestamp
)
VALUES (
S.ID_KEY,
S.SURVEY_QUESTION_ANSWER_KEY,
S.SURVEY_QUESTION_ID,
S.SURVEY_ANSWER_ID,
S.ANSWER_VALUE,
S.IS_ACTIVE,
S.CREATED,
S.CREATED_BY,
S.LAST_MODIFIED,
S.LAST_MODIFIED_BY,
S.SYNC_TIMESTAMP
);

    -- Save max sync_timestamp dan total data
    MERGE INTO DEV_SNOWFLAKE_DB.BRONZE.TBLRECORD_METADATA t
    USING (
      WITH max_ts AS (
        SELECT MAX(sync_timestamp) AS max_timestamp
        FROM DEV_SNOWFLAKE_DB.BRONZE.TBLSVAPRX_SURVEY_QUESTION_ANSWER
      ),
      tot AS (
        SELECT COUNT(*) AS total_data
        FROM DEV_SNOWFLAKE_DB.BRONZE.TBLSVAPRX_SURVEY_QUESTION_ANSWER
      )
      SELECT
        'TBLSVAPRX_SURVEY_QUESTION_ANSWER' AS table_name,
        max_timestamp,
        total_data
      FROM max_ts, tot
    ) s
    ON t.table_name = s.table_name
    WHEN MATCHED THEN UPDATE SET
      t.max_timestamp = s.max_timestamp,
      t.total_data    = s.total_data
    WHEN NOT MATCHED THEN INSERT (table_name, max_timestamp, total_data)
    VALUES (s.table_name, s.max_timestamp, s.total_data);

    -- Delete hanya data yang sudah diproses
    DELETE FROM SNOWFLAKE_LANDING_DB.DEV.TBLSVAPRX_SURVEY_QUESTION_ANSWER
    WHERE TO_TIMESTAMP_NTZ(TO_NUMBER(RECORD_METADATA:CreateTime::string)/1000) <= DATE_TRUNC('DAY',CURRENT_TIMESTAMP());

END;
 