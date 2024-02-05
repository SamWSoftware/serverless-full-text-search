const efsResources = {
  FileSystemResource: {
    Type: "AWS::EFS::FileSystem",
    Properties: {
      FileSystemTags: [
        {
          Key: "Name",
          Value: "sls-free-text-search2",
        },
      ],
      PerformanceMode: "generalPurpose",
      ThroughputMode: "bursting",
    },
  },
  MountTargetSecurityGroup: {
    Type: "AWS::EC2::SecurityGroup",
    Properties: {
      VpcId: "${self:custom.vpcId}",
      GroupDescription: "Security group for search Lambdas",
      SecurityGroupIngress: [
        {
          IpProtocol: "tcp",
          FromPort: 2049,
          ToPort: 2049,
          CidrIp: "0.0.0.0/0",
        },
      ],
    },
  },

  MountTargeta: {
    Type: "AWS::EFS::MountTarget",
    Properties: {
      FileSystemId: { Ref: "FileSystemResource" },
      SecurityGroups: [{ Ref: "EfsSecurityGroup" }],
      SubnetId: "${self:custom.subnetIda}",
    },
  },
  MountTargetb: {
    Type: "AWS::EFS::MountTarget",
    Properties: {
      FileSystemId: { Ref: "FileSystemResource" },
      SecurityGroups: [{ Ref: "EfsSecurityGroup" }],
      SubnetId: "${self:custom.subnetIdb}",
    },
  },
  MountTargetc: {
    Type: "AWS::EFS::MountTarget",
    Properties: {
      FileSystemId: { Ref: "FileSystemResource" },
      SecurityGroups: [{ Ref: "EfsSecurityGroup" }],
      SubnetId: "${self:custom.subnetIdc}",
    },
  },

  AccessPointResource: {
    Type: "AWS::EFS::AccessPoint",
    Properties: {
      FileSystemId: { Ref: "FileSystemResource" },
      PosixUser: {
        Uid: "1000",
        Gid: "1000",
      },
      RootDirectory: {
        CreationInfo: {
          OwnerGid: "1000",
          OwnerUid: "1000",
          Permissions: "750",
        },
        Path: "/export/lambda",
      },
    },
  },

  EfsSecurityGroup: {
    Type: "AWS::EC2::SecurityGroup",
    Properties: {
      VpcId: "${self:custom.vpcId}",
      GroupDescription: "mnt target sg",
      SecurityGroupIngress: [{ IpProtocol: "-1", CidrIp: "0.0.0.0/0" }],
    },
  },
  VPCEndpoint: {
    Type: "AWS::EC2::VPCEndpoint",
    Properties: {
      ServiceName: "com.amazonaws.${self:provider.region}.s3",
      VpcEndpointType: "Gateway",
      VpcId: "${self:custom.vpcId}",
      RouteTableIds: ["${self:custom.routeTableId}"],
    },
  },
};

export default efsResources;
