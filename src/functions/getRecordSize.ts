import { APIGatewayProxyEvent } from "aws-lambda";
import { formatJSONResponse } from "@libs/api-gateway";
import * as fs from "fs";
import elasticlunr from "elasticlunrjs";

const EFS_PATH = "/mnt/efs"; // Mount path for the EFS file system

export const handler = async (event: APIGatewayProxyEvent) => {
  // searching-lambda.js
  try {
    let index = elasticlunr(function () {
      this.setRef("id");
      this.addField("text");
    });

    try {
      const indexData = await fs.promises.readFile(
        `${EFS_PATH}/product_names.json`
      );
      console.log({ indexData: indexData.toString() });

      const indexDataJSON = JSON.parse(indexData.toString());

      console.log("indexDataJSON.documentStore", indexDataJSON.documentStore);

      if (indexDataJSON.version) {
        index = elasticlunr.Index.load(indexDataJSON);
      } else {
        throw new Error("no file found");
      }
    } catch (e) {
      console.log(`no file found or error ${e.message}`);
      return formatJSONResponse({
        statusCode: 404,
        body: { data: "no file index found" },
      });
    }
    // Perform the search
    const { query, limit, options } = JSON.parse(event.body);
    console.log({ query, limit, options });
    const results = index.length;
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
