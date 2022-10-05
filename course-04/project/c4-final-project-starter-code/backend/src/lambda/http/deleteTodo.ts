import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import { getUserId } from '../utils';
import { deleteTodo } from '../../helpers/todos';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
  const userId: string = getUserId(event);
  const todoId: string = event.pathParameters.todoId;
  await deleteTodo(userId, todoId);
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  };
}

