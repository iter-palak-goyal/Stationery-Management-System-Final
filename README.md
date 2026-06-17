# Stationery Management System - Interview Guide & Documentation

## What is this project?
This is a web application that helps a college or organization manage its stationery (like pens, paper, and notebooks). 
- **Students/Employees** can log in and request stationery.
- **Admins/Managers** can log in, review requests, and approve or reject them.
- **The System** keeps track of how many items are left in stock and warns admins when stock is low.

## What does "Microservices Architecture" mean here?
Instead of building one massive program that does everything (which is called a Monolith), we built several smaller, independent programs that talk to each other. These smaller programs are called "Microservices." 

Why do this? 
1. If the "Request Service" crashes, students can still log in and view inventory. 
2. It's easier for different teams to work on different parts of the code.
3. We can run multiple copies of a heavy service (like the Request Service) without duplicating the lighter ones.

## The Architecture Explained in Simple Terms
Imagine our application is a restaurant.

1. **Frontend (React)**: This is the menu and the waiter. It is what the user interacts with on their web browser.
2. **API Gateway**: This is the host at the front door of the restaurant. When the frontend asks for something, it goes to the API Gateway first. The Gateway checks their ID (JWT Token) and then directs their request to the correct kitchen station.
3. **Eureka Server (Service Discovery)**: This is the restaurant's internal phonebook. When a microservice starts up, it registers itself here. That way, the API Gateway knows exactly where to send requests, even if the services change servers or IP addresses.
4. **Config Server**: This is the master recipe book. Instead of every microservice having its own settings file, they all pull their settings (like database passwords) from this central server.
5. **Auth Service**: This is the security guard. It handles logins, creates accounts, and gives users a digital wristband (JWT Token) so they don't have to keep entering their password.
6. **Inventory Service**: This is the stockroom manager. It handles adding new items, counting how many pens are left, and updating stock.
7. **Request Service**: This is the order ticket manager. It handles creating requests, and allows admins to approve or reject them.
8. **MySQL Databases**: Each service (Auth, Inventory, Request) has its own separate database. We don't share one big database because if one service goes down or locks the database, we don't want it to break the others. This makes them truly independent.

## How does Security Work? (JWT)
We use JSON Web Tokens (JWT). When a user logs in with a correct username and password, the Auth Service gives them a long string of characters (the token). 
For the next 24 hours, the user's browser sends this token with every request. The API Gateway checks the token to see who the user is and if they are an ADMIN or a STUDENT. Since the token itself contains the user's role, the server doesn't need to look up their role in the database every time they click a button. This makes the app very fast and "stateless".

## How does the CI/CD Pipeline work? (Jenkins)
CI/CD stands for Continuous Integration and Continuous Deployment.
We have a file called Jenkinsfile. Whenever a developer pushes new code, Jenkins acts like an automated robot worker:
1. It downloads the new code.
2. It builds all the Java services and the React frontend.
3. It runs automated tests (using Mockito) to ensure no one broke existing features.
4. It packages the code into Docker containers (like standard shipping boxes).
5. It deploys the new containers so users can see the updates immediately.

## How to run the project locally
Since we use Docker, running the project is incredibly simple. You do not need to install Java, Node.js, or MySQL manually.

1. Open your terminal in the project folder.
2. Run the command: docker-compose up --build -d
3. Docker will automatically download the databases, compile the Java code, build the React code, and start everything in the correct order.
4. Open your browser and go to http://localhost:3000

## Technologies Used
- Frontend: React.js
- Backend Framework: Java Spring Boot
- Microservices tools: Spring Cloud (Eureka, Config, Gateway)
- Database: MySQL
- Testing: JUnit and Mockito
- Deployment: Docker, Docker Compose, Jenkins
