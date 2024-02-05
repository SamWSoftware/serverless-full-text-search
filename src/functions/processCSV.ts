import { formatJSONResponse } from "@libs/api-gateway";
import { S3CreateEvent } from "aws-lambda";
import * as fs from "fs";
import elasticlunr from "elasticlunrjs";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
const csv = require("csvtojson");

const s3Client = new S3Client();

const EFS_PATH = "/mnt/efs"; // Mount path for the EFS file system

export const handler = async (event: S3CreateEvent) => {
  const startTimestamp = Date.now();
  try {
    console.log(JSON.stringify(event));
    // Load the FlexSearch indexes from EFS, if they exist
    console.log("before read from efs");
    let index;

    index = elasticlunr(function () {
      this.setRef("id");
      this.addField("text");
    });

    let results = [];

    let processCSV;
    let getEFS;
    let addRecords;
    let uploadedEfs;

    try {
      const s3FileLocation = event.Records[0].s3.object.key;
      const s3Bucket = event.Records[0].s3.bucket.name;
      console.log({ s3FileLocation });
      const command = new GetObjectCommand({
        Bucket: s3Bucket,
        Key: s3FileLocation,
      });
      console.log("before sent command", {
        Bucket: s3Bucket,
        Key: s3FileLocation,
      });
      const response = await s3Client.send(command);
      console.log("sent command ", Date.now() - startTimestamp);
      // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
      const csvStr = await response.Body.transformToString();
      results = await csv({
        output: "json",
      })
        .fromString(csvStr)
        .then((csvData) => {
          console.log({ csvData });
          return csvData.map((item) => ({
            id: item.uniq_id,
            text: item.product_name,
          }));
        });

      console.log({ results });
      processCSV = Date.now();
    } catch (e) {
      console.log(`no file found or error: ${e.message}`);
    }

    try {
      const indexData = await fs.promises.readFile(
        `${EFS_PATH}/product_names.json`
      );

      const indexDataJSON = JSON.parse(indexData.toString());
      console.log({ indexDataJSON });

      if (indexDataJSON.version) {
        index = elasticlunr.Index.load(indexDataJSON);
      }
    } catch (e) {
      console.log(`no file found or error: ${e.message}`);
    }
    getEFS = Date.now();

    results.forEach(function (item) {
      index.addDoc(item);
    });

    console.log("before export");
    const indexJSON = index.toJSON();
    console.log({ indexJSON });
    addRecords = Date.now();

    await fs.promises.writeFile(
      `${EFS_PATH}/product_names.json`,
      JSON.stringify(indexJSON)
    );
    uploadedEfs = Date.now();
    console.log("after export");

    let selfSearch = "";
    try {
      selfSearch = index.search(results[1].text.split(" ")[0]);
      console.log({ selfSearch });
    } catch (e) {}

    const now = Date.now();

    console.log({
      processingCSV: processCSV - startTimestamp,
      getEFS: getEFS - processCSV,
      addRecords: addRecords - getEFS,
      uploadedEfs: uploadedEfs - addRecords,
      total: Date.now() - startTimestamp,
    });

    return formatJSONResponse({ body: { selfSearch } });
  } catch (error) {
    console.error(error);
    return formatJSONResponse({ statusCode: 500, body: error.message });
  }
};
