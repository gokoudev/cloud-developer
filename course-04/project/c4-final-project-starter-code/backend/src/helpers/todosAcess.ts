import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createLogger } from '../utils/logger';
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';
import { getUploadUrl } from './attachmentUtils';

const XAWS = AWSXRay.captureAWS(AWS);
const bucketName = process.env.ATTACHMENT_S3_BUCKET;
const logger = createLogger('TodosAccess');

export class TodosAccess {

    constructor(
      private readonly docClient: DocumentClient = createDynamoDBClient(),
      private readonly todosTable = process.env.TODOS_TABLE) {
    }

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info('Starting ------>: getAllTodos()');
        const result = await this.docClient.query({
          TableName: this.todosTable,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId
          }
        }).promise();

        logger.info('Finished ------>: getAllTodos()');
        const items = result.Items;
        return items as TodoItem[];
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info('Starting ------>: createTodo()');
        await this.docClient.put({
          TableName: this.todosTable,
          Item: todo
        }).promise();
    
        logger.info('Finished ------>: getAllTodos()');
        return todo;
    }

    async updateTodo(userId: string, todoId: string, todo: TodoUpdate): Promise<void> {
      logger.info('Starting ------>: updateTodo()');
      await this.docClient.update({
        TableName: this.todosTable,
        Key: { todoId, userId },
        UpdateExpression: "SET #title_todo = :name, dueDate = :dueDate, done = :done",
        ExpressionAttributeNames: {
          "#title_todo": "name",
        },
        ExpressionAttributeValues: {
          ":name": todo.name,
          ":dueDate": todo.dueDate,
          ":done": todo.done,
        },
        ReturnValues: "UPDATED_NEW"
      }).promise();
      logger.info('Finished ------>: updateTodo()');
      return;
    }

    async deleteTodo(userId: string, todoId: string): Promise<void> {
      logger.info('Starting ------>: deleteTodo()');
      await this.docClient.delete({
        TableName: this.todosTable,
        Key: { todoId, userId },
      }).promise();
      logger.info('Finished ------>: deleteTodo()');
      return;
    }

    async generateUploadUrl(userId: string, todoId: string): Promise<String> {
      logger.info('Starting ------>: generateUploadUrl()');
      const url = getUploadUrl(todoId);
      const attachmentUrl: string = 'https://' + bucketName + '.s3.amazonaws.com/' + todoId;
      await this.docClient.update({
        TableName: this.todosTable,
        Key: {userId, todoId},
        UpdateExpression: "set attachmentUrl = :url",
        ExpressionAttributeValues: {
          ":url": attachmentUrl
        },
        ReturnValues: "UPDATED_NEW"
      }).promise()
      logger.info('Finished ------>: generateUploadUrl()');
      return url;
    }

    async todoExists(userId: string, todoId: string): Promise<boolean>  {
      const result = await this.docClient.get({
          TableName: this.todosTable,
          Key: {userId, todoId}
        }).promise();
      return !!result.Item;
    }

}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
      console.log('Creating a local DynamoDB instance');
      return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
      });
  }
  return new XAWS.DynamoDB.DocumentClient();
}