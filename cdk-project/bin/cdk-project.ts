#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import SwaggerParser = require("@apidevtools/swagger-parser");
import { UserApiGatewayStack } from "../stacks/apiGateway/userApiGatewayStack";

async function createApp(): Promise<cdk.App> {
  ///------------------------------------------------------------
  /// StackApp生成
  ///------------------------------------------------------------
  const app = new cdk.App();

  try {
    ///------------------------------------------------------------
    /// UserApiGatewayデプロイ
    ///------------------------------------------------------------
    const userApiDefinition = await SwaggerParser.dereference(
      "openapi/definitions/user-api.yaml"
    );
    new UserApiGatewayStack(app, "userApiGatewayStack", {
      userApiDefinition: userApiDefinition,
    });

    return app;
  } catch (e: any) {
    console.error(e);
    throw e;
  }
}

createApp();
