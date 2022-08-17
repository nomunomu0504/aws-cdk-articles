import { Construct } from "constructs";
import {
  aws_iam as iam,
  aws_apigateway as apigw,
  aws_route53 as route53,
  aws_certificatemanager as certificateManager,
  Stack,
  StackProps,
  Fn,
} from "aws-cdk-lib";
import { UserLambdaTask } from "./tasks/userLambdaTask";

type Props = StackProps & {
  userApiDefinition: any;
};

export class UserApiGatewayStack extends Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    /// Stackが実行されるリージョン
    const REGION = Stack.of(this).region;
    /// Stackが実行されるAWSAccountId
    const ACCOUNT = Stack.of(this).account;

    ///------------------------------------------------------------
    /// Lambda
    ///------------------------------------------------------------
    /// ユーザーAPI呼び出し用Lambda
    const userLambdaTask = new UserLambdaTask(this, "userLambdaTask");

    ///------------------------------------------------------------
    /// APIGW - userApi
    ///------------------------------------------------------------
    /// OpenApiの定義からAPIGatewayのAPI定義生成
    const userApiDefinition = apigw.AssetApiDefinition.fromInline(
      props.userApiDefinition
    );
    /// APIGatewayのエンドポイント生成
    const userApi = new apigw.SpecRestApi(this, "userApi", {
      restApiName: "aws-cdk-articles-user-api",
      apiDefinition: userApiDefinition,
      deployOptions: {
        stageName: "development",
      },
      deploy: true,
    });
    /// APIGW Lambda Permission
    userLambdaTask.lambda.addPermission("userListLambdaPermission", {
      principal: new iam.ServicePrincipal("apigateway.amazonaws.com"),
      action: "lambda:InvokeFunction",
      sourceArn: `arn:aws:execute-api:${REGION}:${ACCOUNT}:${userApi.restApiId}/*/*/users`,
    });
    userLambdaTask.lambda.addPermission("userDetailLambdaPermission", {
      principal: new iam.ServicePrincipal("apigateway.amazonaws.com"),
      action: "lambda:InvokeFunction",
      sourceArn: `arn:aws:execute-api:${REGION}:${ACCOUNT}:${userApi.restApiId}/*/*/users/*`,
    });

    ///------------------------------------------------------------
    /// APIGW Lambda Integration
    ///------------------------------------------------------------
    /// /userにLambdaを結合

    props.userApiDefinition.paths["/users"]["get"][
      "x-amazon-apigateway-integration"
    ] = {
      type: "aws_proxy",
      passthroughBehavior: "when_no_match",
      httpMethod: "post",
      contentHandling: "CONVERT_TO_TEXT",
      uri: `arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/arn:aws:lambda:${REGION}:${ACCOUNT}:function:${userLambdaTask.lambda.functionName}/invocations`,
    };
    /// /user/{id}にLambdaを結合
    props.userApiDefinition.paths["/users/{id}"]["get"][
      "x-amazon-apigateway-integration"
    ] = {
      type: "aws_proxy",
      passthroughBehavior: "when_no_match",
      httpMethod: "post",
      contentHandling: "CONVERT_TO_TEXT",
      requestTempalte: {
        "application/json": "{ \"userId\": $input.params('id')",
      },
      uri: `arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/arn:aws:lambda:${REGION}:${ACCOUNT}:function:${userLambdaTask.lambda.functionName}/invocations`,
    };
  }
}
