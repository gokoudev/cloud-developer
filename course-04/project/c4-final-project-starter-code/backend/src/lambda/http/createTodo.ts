import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import { getUserId } from '../utils';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { createTodo } from '../../helpers/todos';

export const handler: APIGatewayProxyHandler = 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId: string = getUserId(event);
  const todoReq: CreateTodoRequest = JSON.parse(event.body);
  const todoRes = await createTodo(userId, todoReq);
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: todoRes
    })
  };
}

