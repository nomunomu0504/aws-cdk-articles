import {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
  APIGatewayProxyResultV2,
} from "aws-lambda/trigger/api-gateway-proxy";
import { z } from "zod";

/**
 * I/O
 */
const UserLambdaRequest = z.object({
  id: z.number().optional(),
});
type UserLambdaRequest = z.infer<typeof UserLambdaRequest>;

const User = z.object({
  id: z.number(),
  name: z.string(),
  age: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});
type User = z.infer<typeof User>;

const UserDetailLambdaResponse = z.object({
  user: User,
});
type UserDetailLambdaResponse = z.infer<typeof UserDetailLambdaResponse>;

const UserListLambdaResponse = z.object({
  users: z.array(User),
});
type UserListLambdaResponse = z.infer<typeof UserListLambdaResponse>;

const ErrorResponse = z.object({
  ok: z.boolean(),
  error: z.object({
    message: z.string(),
  }),
});
type ErrorResponse = z.infer<typeof ErrorResponse>;

type Response =
  | UserDetailLambdaResponse
  | UserListLambdaResponse
  | ErrorResponse;

/**
 * ハンドラー
 */
export const handler: APIGatewayProxyHandlerV2<Response> = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2<Response>> => {
  try {
    ///------------------------------------------------------------
    /// バリデーション
    ///------------------------------------------------------------
    const hasUserId = event.pathParameters;

    const dummyUserList = [
      {
        id: 1,
        name: "test1",
        age: 20,
        created_at: "2020-01-01",
        updated_at: "2020-01-02",
      },
      {
        id: 2,
        name: "test2",
        age: 21,
        created_at: "2020-01-03",
        updated_at: "2020-01-04",
      },
      {
        id: 3,
        name: "test4",
        age: 22,
        created_at: "2020-01-05",
        updated_at: "2020-01-06",
      },
    ];

    const responseData = hasUserId
      ? {
          user: dummyUserList[0],
        }
      : {
          users: dummyUserList,
        };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ok: true,
        ...responseData,
      }),
    };
  } catch (e: any) {
    console.error(e);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ok: false,
        error: {
          message: e.message,
        },
      }),
    };
  }
};
