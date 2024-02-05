import functions from "./functions";

const Properties = {
  FileSystemConfigs: [
    {
      Arn: {
        "Fn::GetAtt": ["AccessPointResource", "Arn"],
      },
      LocalMountPath: "/mnt/efs",
    },
  ],
};

const entries = Object.keys(functions).map((lambdaFunctionName) => [
  lambdaFunctionName + "LambdaFunction",
  { Properties },
]);

const extensions = Object.fromEntries(entries);
export default extensions;
