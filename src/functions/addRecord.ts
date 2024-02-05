import { formatJSONResponse } from "@libs/api-gateway";
import { APIGatewayProxyEvent } from "aws-lambda";
import * as fs from "fs";

const { Index } = require("flexsearch");
const EFS_PATH = "/mnt/efs"; // Mount path for the EFS file system

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const index = new Index();
    // Load the FlexSearch indexes from EFS, if they exist
    console.log("before read from efs");
    try {
      const indexData = await fs.promises.readFile(`${EFS_PATH}/product_names`);
      console.log({ indexData });

      if (indexData) {
        await index.import("product_names", indexData);
      }
    } catch (e) {
      console.log("no file found");
    }

    console.log("after import");
    const { id, text } = JSON.parse(event.body);

    index.add(id, text);

    await index.export(async (key, data) => {
      console.log("exporting");
      console.log({ key, data });
      await fs.promises.writeFile(`${EFS_PATH}/product_names`, data);
      return;
    });

    const selfSearch = index.search(text.split(" ")[0]);
    console.log({ selfSearch });

    const dirs = fs.readdirSync(`${EFS_PATH}/`);
    console.log({ dirs });

    return formatJSONResponse({ body: { selfSearch, dirs } });
  } catch (error) {
    console.error(error);
    return formatJSONResponse({ statusCode: 500, body: error.message });
  }
};
