import { APIGatewayProxyEvent } from "aws-lambda";
import { formatJSONResponse } from "@libs/api-gateway";
import * as fs from "fs";
import elasticlunr from "elasticlunrjs";

const EFS_PATH = "/mnt/efs"; // Mount path for the EFS file system

let cache = {
  data: undefined,
  refresh: 0,
};

export const handler = async (event: APIGatewayProxyEvent) => {
  // searching-lambda.js
  try {
    let index = elasticlunr(function () {
      this.setRef("id");
      this.addField("text");
    });

    try {
      if (cache.refresh > Date.now()) {
        index = elasticlunr.Index.load(cache.data);
      } else {
        const indexData = await fs.promises.readFile(
          `${EFS_PATH}/product_names.json`
        );
        console.log({ indexData: indexData.toString() });

        const indexDataJSON = JSON.parse(indexData.toString());

        if (indexDataJSON.version) {
          index = elasticlunr.Index.load(indexDataJSON);
          cache = {
            data: indexDataJSON,
            refresh: Date.now() + 1000 * 60 * 60 * 1, // 1 hour
          };
        } else {
          throw new Error("no file found");
        }
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
    const results = index.search(query);
    console.log({ results });
    return formatJSONResponse({
      body: {
        results,
        params: { query, limit, options },
        indexLength: index.documentStore.length,
      },
    });
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify(error.message),
    };
  }
};
