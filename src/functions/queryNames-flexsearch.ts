import { APIGatewayProxyEvent } from "aws-lambda";
import { formatJSONResponse } from "@libs/api-gateway";
import * as fs from "fs";
const { Index } = require("flexsearch");
const EFS_PATH = "/mnt/efs"; // Mount path for the EFS file system

export const handler = async (event: APIGatewayProxyEvent) => {
  // searching-lambda.js
  try {
    const index = new Index();
    // Load the FlexSearch indexes from EFS
    try {
      const indexData = await fs.promises.readFile(`${EFS_PATH}/product_names`);
      console.log({ indexData: indexData.toString() });

      if (indexData) {
        await index.import("product_names", indexData);
      }
    } catch (e) {
      console.log("no file found");
      return formatJSONResponse({
        statusCode: 404,
        body: { data: "no file index found" },
      });
    }
    // Perform the search
    const { query, limit, options } = JSON.parse(event.body);
    console.log({ query, limit, options });
    const results = index.search(query);
    console.log({ results });
    return formatJSONResponse({
      body: { results, params: { query, limit, options } },
    });
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify(error.message),
    };
  }
};
