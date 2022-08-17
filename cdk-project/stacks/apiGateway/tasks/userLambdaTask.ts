import { aws_lambda as lambda, Duration } from "aws-cdk-lib";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { LogLevel, NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class UserLambdaTask extends Construct {
  public readonly lambda: lambda.Function;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.lambda = new NodejsFunction(this, "userLambda", {
      functionName: "aws-cdk-articles-user-lambda",
      entry: "lambda/apigw/user/index.ts",
      runtime: lambda.Runtime.NODEJS_14_X,
      retryAttempts: 0,
      timeout: Duration.seconds(120),
      memorySize: 512,
      bundling: {
        sourceMap: true,
        forceDockerBundling: false,
        logLevel: LogLevel.INFO,
      },
      environment: {
        AWS_NODEJS_CONNECTIONS_REUSE_ENABLED: "1",
      },
    });
  }
}
