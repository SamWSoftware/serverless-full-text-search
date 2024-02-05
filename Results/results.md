# Results

## Querying Records

### Normal query

This case the EFS is downloaded every time

| Index Size | results | time | cold start |
| ---------- | ------- | ---- | ---------- |
| 3009       | 4       | 929  | yes        |
| 3009       | 4       | 309  | no         |
| 3009       | 39      | 301  | no         |
| 3009       | 39      | 198  | no         |
| 3009       | 39      | 295  | no         |
| 20,000     | 50      | 1923 | yes        |
| 20,000     | 50      | 719  | no         |
| 20,000     | 50      | 875  | no         |
| 20,000     | 50      | 751  | no         |
| 20,000     | 10      | 947  | no         |
| 20,000     | 10      | 926  | no         |
| 20,000     | 10      | 623  | no         |

### Cached EFS

This case caches the EFS data into Lambda memory (global variables).

| Index Size | results | time | cold start / cache refresh |
| ---------- | ------- | ---- | -------------------------- |
| 3009       | 39      | 878  | yes                        |
| 3009       | 39      | 62   | no                         |
| 3009       | 39      | 38   | no                         |
| 3009       | 39      | 45   | no                         |
| 3009       | 39      | 49   | no                         |
| 3009       | 4       | 39   | no                         |
| 3009       | 4       | 48   | no                         |
| 3009       | 4       | 54   | no                         |
| 20,000     | 4       | 1493 | yes                        |
| 20,000     | 50      | 47   | no                         |
| 20,000     | 50      | 57   | no                         |
| 20,000     | 50      | 41   | no                         |

## Adding Records

### Adding a single record

Average of 3 runs = 61ms

### adding 3 records

cold start = 793ms
3 runs

100, 63, 72 = 79ms

### adding 1000 records

| existing records | time ms | cold start |
| ---------------- | ------- | ---------- |
| 16               | 1018    | yes        |
| 16               | 852     | no         |
| 1016             | 962     | no         |
| 2016             | 1314    | no         |

## Adding CSV file

We upload the files in the data section. These csvs include not just the name and id, but description and other data. This makes it a more realistic. You could definitely decrease the duration by clearing the csv file first. This would minimise the memory usage and time to get the file from S3.

### 1000 records in a csv ( 1.7MB )

| existing records | time ms | max memory | cold start |
| ---------------- | ------- | ---------- | ---------- |
| 3010             | 1286    | 200        | no         |

### 20,000 records in a csv ( 36.3 MB)

| existing records | time ms | max memory | cold start |
| ---------------- | ------- | ---------- | ---------- |
| 4010             | 7283    | 591        | yes        |

Note: here are the time breakdowns for the 20K records. 4.4s are from downloading the CSV.

processingCSV: 4407,
getEFS: 223,
addRecords: 1857,
uploadedEfs: 790,
total: 7279
