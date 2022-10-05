import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils';
import { updateTodo } from '../../helpers/todos';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
  const userId: string = getUserId(event);
  const todoId: string = event.pathParameters.todoId;
  const todoReq: UpdateTodoRequest = JSON.parse(event.body);
  await updateTodo(userId, todoId, todoReq);
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  };
}
