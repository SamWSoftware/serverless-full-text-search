const vpcConfig = {
  securityGroupIds: [{ Ref: "EfsSecurityGroup" }],
  subnetIds: "${self:custom.subnetIds}" as any as string[],
};

const efsIamRole = [
  {
    Effect: "Allow",
    Action: [
      "elasticfilesystem:ClientMount",
      "elasticfilesystem:ClientRootAccess",
      "elasticfilesystem:ClientWrite",
      "elasticfilesystem:DescribeMountTargets",
    ],
    Resource: "*",
  },
  {
    Effect: "Allow",
    Action: [
      "ec2:CreateNetworkInterface",
      "ec2:DescribeNetworkInterfaces",
      "ec2:DeleteNetworkInterface",
    ],
    Resource: "*",
  },
  {
    Effect: "Allow",
    Action: ["s3:*"],
    Resource: "*",
  },
];

const functions = {
  AddRecord: {
    handler: "src/functions/addRecord.handler",
    events: [
      {
        http: {
          method: "post",
          path: "addrecord",
        },
      },
    ],
    vpc: vpcConfig,
    iamRoleStatements: efsIamRole,
    dependsOn: ["MountTargetc"],
  },
  AddRecords: {
    handler: "src/functions/addRecords.handler",
    events: [
      {
        http: {
          method: "post",
          path: "addrecords",
        },
      },
    ],
    vpc: vpcConfig,
    iamRoleStatements: efsIamRole,
    dependsOn: ["MountTargetc"],
  },
  QueryNames: {
    handler: "src/functions/queryNames.handler",
    events: [
      {
        http: {
          method: "post",
          path: "querynames",
        },
      },
    ],
    vpc: vpcConfig,
    iamRoleStatements: efsIamRole,
    dependsOn: ["MountTargetc"],
  },
  QueryNamesCached: {
    handler: "src/functions/queryNames-cached.handler",
    events: [
      {
        http: {
          method: "post",
          path: "querycache",
        },
      },
    ],
    vpc: vpcConfig,
    iamRoleStatements: efsIamRole,
    dependsOn: ["MountTargetc"],
  },
  ProcessCSV: {
    handler: "src/functions/processCSV.handler",
    events: [
      {
        s3: {
          bucket: "s3-search-upload-bucket-fdhsjkafdsg",
          event: "s3:ObjectCreated:*",
        },
      },
    ],
    vpc: vpcConfig,
    iamRoleStatements: efsIamRole,
    dependsOn: ["MountTargetc"],
    timeout: 60,
  },
  ProcessDynamoStream: {
    handler: "src/functions/processDynamoStream.handler",
    events: [],
    vpc: vpcConfig,
    iamRoleStatements: efsIamRole,
    dependsOn: ["MountTargetc"],
  },
  Clear: {
    handler: "src/functions/clear.handler",
    events: [
      {
        http: {
          method: "post",
          path: "clear",
        },
      },
    ],
    vpc: vpcConfig,
    iamRoleStatements: efsIamRole,
    dependsOn: ["MountTargetc"],
  },
};

export default functions;
