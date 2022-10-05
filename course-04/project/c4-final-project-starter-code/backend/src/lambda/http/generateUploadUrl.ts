import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import { generateUploadUrl } from '../../helpers/todos';
import { getUserId } from '../utils';
import { todoExists } from '../../helpers/todos';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    const userId: string = getUserId(event);
    const todoId: string = event.pathParameters.todoId;
    const isExisted = await todoExists(userId, todoId);

    if (!isExisted) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          error: 'Todo does not exist'
        })
      }
    }
  
    const url = await generateUploadUrl(userId, todoId);
  
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        uploadUrl: url
      })
    };
}