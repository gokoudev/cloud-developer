import { TodosAccess } from './todosAcess';
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import * as uuid from 'uuid';

const todoAccess = new TodosAccess();

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
  return todoAccess.getAllTodos(userId);
}

export async function createTodo(
    userId: string, createTodoRequest: CreateTodoRequest
  ): Promise<TodoItem> {
  const todoId = uuid.v4();
  return await todoAccess.createTodo({
      todoId: todoId,
      createdAt: new Date().toISOString(),
      userId: userId,
      name: createTodoRequest.name,
      dueDate: createTodoRequest.dueDate,
      done: false
  });
}

export async function updateTodo(
  userId: string, todoId: string, updateTodoRequest: UpdateTodoRequest
  ): Promise<void> {
  const updatedTodo: TodoUpdate = {
      name: updateTodoRequest.name,
      dueDate: updateTodoRequest.dueDate,
      done: updateTodoRequest.done
  }
  return await todoAccess.updateTodo(userId, todoId, updatedTodo);
}

export async function deleteTodo(userId: string, todoId: string): Promise<void> {
  return todoAccess.deleteTodo(userId, todoId);
}

export async function generateUploadUrl(userId: string, todoId: string): Promise<String> {
  return await todoAccess.generateUploadUrl(userId, todoId);
}

export async function todoExists(userId: string, todoId: string): Promise<boolean> {
  return await todoAccess.todoExists(userId, todoId);
}