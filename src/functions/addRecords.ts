import { formatJSONResponse } from "@libs/api-gateway";
import { APIGatewayProxyEvent } from "aws-lambda";
import * as fs from "fs";
import elasticlunr from "elasticlunrjs";

const EFS_PATH = "/mnt/efs"; // Mount path for the EFS file system

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    // Load the FlexSearch indexes from EFS, if they exist
    console.log("before read from efs");
    let index;

    const items = JSON.parse(event.body);
    index = elasticlunr(function () {
      this.setRef("id");
      this.addField("text");
    });

    try {
      const indexData = await fs.promises.readFile(
        `${EFS_PATH}/product_names.json`
      );
      console.log({ indexData: indexData.toString() });

      const indexDataJSON = JSON.parse(indexData.toString());

      if (indexDataJSON.version) {
        index = elasticlunr.Index.load(indexDataJSON);
      }
    } catch (e) {
      console.log(`no file found or error: ${e.message}`);
    }

    items.forEach(function (item) {
      index.addDoc(item);
    });

    console.log("before export");
    const indexJSON = index.toJSON();
    console.log({ indexJSON });

    await fs.promises.writeFile(
      `${EFS_PATH}/product_names.json`,
      JSON.stringify(indexJSON)
    );

    console.log("after export");
    let selfSearch = "";
    try {
      selfSearch = index.search(items[1].text.split(" ")[0]);
      console.log({ selfSearch });
    } catch (e) {}

    return formatJSONResponse({ body: { selfSearch } });
  } catch (error) {
    console.error(error);
    return formatJSONResponse({ statusCode: 500, body: error.message });
  }
};
