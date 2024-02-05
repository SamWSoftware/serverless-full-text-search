import { APIGatewayProxyEvent } from "aws-lambda";
import { formatJSONResponse } from "@libs/api-gateway";
import * as fs from "fs";

const EFS_PATH = "/mnt/efs"; // Mount path for the EFS file system

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    await fs.promises.unlink(`${EFS_PATH}/product_names.json`);

    console.log("Cleared product_names.json");
    let data = "";
    try {
      const indexData = await fs.promises.readFile(
        `${EFS_PATH}/product_names.json`
      );
      console.log({ indexData: indexData.toString() });
      data = indexData.toString();
    } catch (e) {
      data = e.message;
    }

    return formatJSONResponse({ body: { data } });
  } catch (error) {
    console.error(error);
    return formatJSONResponse({ statusCode: 500, body: error.message });
  }
};
