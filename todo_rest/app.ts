import { nanoid } from "nanoid";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { access } from "fs";
const dynamoDb = require('aws-sdk/clients/dynamodb')
const docClient = new dynamoDb.DocumentClient()
let response:any;
const tableName = 'TodoLists'
const now = new Date();


export const getAllTodo = async (event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult>=> {
    try {
        const todos = await docClient.scan({
            TableName: tableName
        }).promise()
        response = {
            statusCode: 200,
            body: JSON.stringify({
                message: todos.Items,
            }),
        };
    } catch (err) {
        console.log(err);
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: err,
            }),
        };
    }
    return response;
};
export const getTodoBasedOnId = async (event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult>=>{
    try{
        const id = event.pathParameters?.id
        console.log(typeof id)
            await docClient.get({
                TableName:tableName,
                Key:{
                    id: id
                }
            }).promise()
        response = {
            'statusCode':200,
            'body':JSON.stringify({
                "Message":"Todo deleted successfully!"
            })
        }
        return response
    }
    catch(err){
        console.log(err);
        response = {
            statusCode: 500,
            body: JSON.stringify({
                err,
            }),
        };
        return response
    }
}
export const createTodo = async (event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult>=> {
    const reqBody = JSON.parse(event.body as string)
    try {
        const todo ={
            id:nanoid(8),
            subject:reqBody.subject,
            todo:reqBody.todo,
            createdAt:now.toLocaleString(),
            completed:false
        }
        const data = await docClient.put({
            TableName: tableName,
            Item:todo
        }).promise()
        console.log(data)
        response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'New todo is created successfully!',
            }),
        };
    } catch (err) {
        console.log(err);
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Unable to create a todo',
            }),
        };
    }
    return response;
};
export const updateTodo = async (event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult>=>{
    const reqBody = JSON.parse( event.body as string )
    try {
        await docClient.update({
            TableName:tableName,
            Key: { id: reqBody.id },
                UpdateExpression:
                "set todo = :todo",
                ExpressionAttributeValues: {
                    ":todo": reqBody.todo,
                    ":completed":reqBody.completed
                },
                ReturnValues: "ALL_NEW",
        }).promise();

        response = {
            statusCode: 200,
            body: JSON.stringify({
                message: "success",
            }),
        };
    } catch (err) {
        console.log(err);
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Unable to update todo',
            }),
        };
    }
    return response;
}
export const deleteTodo = async (event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult>=>{
    try{
        const id = event.pathParameters?.id
        console.log(typeof id)
            await docClient.delete({
                TableName:'TodoLists',
                Key:{
                    id: id
                }
            }).promise()
        response = {
            'statusCode':200,
            'body':JSON.stringify({
                "Message":"Todo deleted successfully!"
            })
        }
        return response
    }
    catch(err){
        console.log(err);
        response = {
            statusCode: 500,
            body: JSON.stringify({
                err,
            }),
        };
        return response
    }
}