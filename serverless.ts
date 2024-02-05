import type { AWS } from "@serverless/typescript";

import functions from "./serverless/functions";
import efsResources from "./serverless/efs";
import extensions from "./serverless/functionExtensions";

const serverlessConfiguration: AWS = {
  service: "sls-free-text-search2",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild", "serverless-iam-roles-per-function"],
  provider: {
    name: "aws",
    runtime: "nodejs18.x",
    profile: "serverlessCommunityAct",
    region: "eu-central-1",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
    },
  },
  // import the function via paths
  functions,
  resources: {
    extensions,
    Resources: {
      ...efsResources,
    },
  },
  package: { individually: true },
  custom: {
    vpcId: "vpc-0e7ac5172e47e0406",
    subnetIds: [
      "subnet-065806c293437f55b",
      "subnet-06878f5afd1837e5b",
      "subnet-0205930a280b2e0ad",
    ],
    subnetIda: "subnet-065806c293437f55b",
    subnetIdb: "subnet-06878f5afd1837e5b",
    subnetIdc: "subnet-0205930a280b2e0ad",
    routeTableId: "rtb-03275cc36afec9326",
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node18",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
