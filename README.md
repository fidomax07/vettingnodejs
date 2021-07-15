# Vetting NodeJS Experimental API

## Description
This is a REST API that offers user registration and authentication, and implements a way for the users of the system to be able to like/unlike each other.

The API also allows users to modify their initial passwords, and displays their profile with likes statistics, and an overall listing of all users with their likings count.

Project is build on Node.js platform, using Express.js framework, and mongoDB as the database.

Due to the simple business logic, the choice of the database was not an issue if either going with an SQL or NoSQL database. So consequently, the mongoDB is chosen based on the author's preference. 

## Testing ready deployed version

The API is deployed and can be tested in the following link:   
https://vettingnodejs.herokuapp.com   
with the following Postman collection:   
https://www.getpostman.com/collections/d4fbe648489810977df4   
by setting the following Postman environment variables:
```shell
url=<above base url of the API>
token=<is set automatically during the login>
user_id=<to any user-id relevant to the context>
```
Note that, in some cases when importing Postman collections from the link, the Postman doesn't synchronize 
individual requests Authorization settings, which may lead to some requests not working properly, please 
check request's Authorization setting if having authentication issues. 

## Installing and configuring locally

To get the project and start it locally or in a Docker container, besides the usual `npm install` command to install the dependencies,
the project environment variables that have to be set, and that are included also in the `.env.example` file, are the following:   
```shell
PORT=
MONGODB_URL=
JWT_SECRET=
```

API tests can be run with: `npm run test`

When using Docker to build the API images and run the project locally or run API tests, the following `npm` scripts can be used:   
```shell
npm run docker:dev
npm run docker:test
```


