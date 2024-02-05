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
    const items = JSON.parse(event.body);
    console.log("items", items);

    items.forEach((item) => {
      index.add(item.id, item.text);
    });
    console.log("before export");

    await index.export(async (key, data) => {
      console.log("exporting");
      console.log({ key, data });
      await fs.promises.writeFile(`${EFS_PATH}/product_names`, data);
      return;
    });

    console.log("after export");

    const selfSearch = index.search(items[1].text.split(" ")[0]);
    console.log({ selfSearch });

    return formatJSONResponse({ body: { selfSearch } });
  } catch (error) {
    console.error(error);
    return formatJSONResponse({ statusCode: 500, body: error.message });
  }
};
