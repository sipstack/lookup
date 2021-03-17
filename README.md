# lookup

Supplementary project for API / SBC / UCS
Internal Call Lookup / Locales

# Examples

## **country**

| id  | name        | iso3 | iso2 | phone_code | capital | currency | currency_symbol | tld | native            | region             | subregion                                                                                                         | timezones | latitude | longitude | emoji   | emojiU  |
| --- | ----------- | ---- | ---- | ---------- | ------- | -------- | --------------- | --- | ----------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------- | --------- | -------- | --------- | ------- | ------- |
| 1   | Afghanistan | AFG  | AF   | 93         | Kabul   | AFN      | Ø‹              | .af | Ø§ÙØºØ§Ù†Ø³ØªØ§Ù† | Asia Southern Asia | [{zoneName:'Asia\/Kabul',gmtOffset:16200,gmtOffsetName:'UTC+04:30',abbreviation:'AFT',tzName:'Afghanistan Time'}] | 33        | 65       | ðŸ‡¦ðŸ‡«  | U+1F1E6 | U+1F1EB |

...

## **state**

| id   | name       | country_id | state_code | latitude   | longitude  |
| ---- | ---------- | ---------- | ---------- | ---------- | ---------- |
| 3901 | Badakhshan | 1          | BDS        | 36.7347725 | 70.8119953 |

...

## **city**

| id  | name      | state_id | latitude | longitude |
| --- | --------- | -------- | -------- | --------- |
| 52  | AshkÄsham | 3901     | 36.68333 | 71.53333  |

...

## **ocn** (Operating Company Number / name)

| id  | code | name                                     | city_id | website    |
| --- | ---- | ---------------------------------------- | ------- | ---------- |
| 1   | 389C | EUREKA TELECOM, INC. DBA EUREKA NETWORKS | 1       | eureka.com |
| 2   | 4804 | LEVEL 3 COMMUNICATIONS, LLC              | 1       | level3.com |

...

## **lir** [Local Interconnection Region] (Canada only)

| id  | code   | description |
| --- | ------ | ----------- |
| 1   | 805001 | Hull        |
| 2   | 805002 | Ste-Agathe  |

...

## **lata** [Local access and transport area] (North America only)

| id  | code | description |
| --- | ---- | ----------- |
| 1   | 120  | Maine       |
| 2   | 888  | Canada      |

...

## **exchange** (rate_centre) (Canada/US Only)

| id  | code   | city_id | lata | lir    | ocn_id |
| --- | ------ | ------- | ---- | ------ | ------ |
| 1   | 158340 | 1       | 888  | 805106 |        |
| 2   | 158270 | 1       | 222  |        |        |

...

## **switch** (first 7 characters is location / last 4 are sequence id)

| id  | code        | name | type | exchange_id | ocn_id |
| --- | ----------- | ---- | ---- | ----------- | ------ |
| 1   | IPRTPQAC0MD |      | POI  | 1           | 1      |

...

## **dial**

| id  | slug    | description      | country_code | area_code | city_id | exchange_id | ocn_id | date_effective | date_discontinued |
| --- | ------- | ---------------- | ------------ | --------- | ------- | ----------- | ------ | -------------- | ----------------- |
| 1   | 1416477 | extra info as () | 1            | 416       | 1       | 15443       | 33     |                |                   |
| 1   | 1416472 | extra info as () | 1            | 416       | 555     | 15444       | 22     |                |                   |

...
