import { formatJSONResponse } from "@libs/api-gateway";
import { APIGatewayProxyEvent } from "aws-lambda";
import * as fs from "fs";
import lunr from "lunr";

const EFS_PATH = "/mnt/efs"; // Mount path for the EFS file system

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    // Load the FlexSearch indexes from EFS, if they exist
    console.log("before read from efs");
    let index;

    const items = JSON.parse(event.body);

    try {
      throw new Error("no file found");
      const indexData = await fs.promises.readFile(`${EFS_PATH}/product_names`);
      console.log({ indexData });

      if (JSON.parse(indexData.toString()).length > 0) {
        index = lunr(function () {
          this.ref("id");
          this.field("text");

          [...indexData, ...items].forEach(function (doc) {
            this.add(doc);
          }, this);
        });
      }
    } catch (e) {
      console.log(`no file found or error ${e.message}`);

      index = lunr(function () {
        this.ref("id");
        this.field("text");

        items.forEach(function (item) {
          this.add(item);
        }, this);
      });
    }

    console.log("before export");
    const indexJSON = JSON.stringify(index);
    console.log({ indexJSON });

    console.log("after export");

    const selfSearch = index.search(items[1].text.split(" ")[0]);
    console.log({ selfSearch });

    return formatJSONResponse({ body: { selfSearch } });
  } catch (error) {
    console.error(error);
    return formatJSONResponse({ statusCode: 500, body: error.message });
  }
};
