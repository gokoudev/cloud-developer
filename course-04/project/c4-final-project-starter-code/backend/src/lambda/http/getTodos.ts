import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { getAllTodos } from '../../helpers/todos';
import { getUserId } from '../utils';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event);
  const todos = await getAllTodos(userId);
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({items: todos})
  }
}

