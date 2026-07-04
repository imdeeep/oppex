# Master Architecture Guide: Identity & Access Management System

## 1. The Assignment Statement

**Goal:** Develop, deploy, and host a user signup and login process.

**Requirements:**

1. Users should be able to sign-up to the portal using their email ID and choose a password. The password should be saved as salted encryption in the database.
    
2. Users should be able to validate their email after the signup.
    
3. Users should be able to login.
    
    - If unvalidated: Show "You need to validate your email to access the portal".
        
    - If validated: Show "Your email is validated. You can access the portal".
        
4. Users should be able to log out. After logging out, returning to the portal should show the login page.
    
5. Write tests for both backend and front end code.
    
6. Create services in **Quarkus** (User Service, Persistence layer). Session Management and the layer between UI and backend must be in **Node.js**.
    
7. **Tech stack:** Quarkus (backend container) + Postgresql (Database) + React + Node + HTML/CSS. Use Maven for backend build.
    
8. **Deployment:** Deploy on AWS (free-tier). Share portal link and GitHub source.
    

## 2. The Architecture: Backend-For-Frontend (BFF)

We are using an enterprise architecture pattern called **Backend-For-Frontend (BFF)**. Instead of the user's browser talking directly to the core database API, we use a middleman.

**The Restaurant Analogy:**

- **React (The Customer):** Sits at the table, asks for things, and looks at the final presentation.
    
- **Node.js (The Waiter):** The BFF layer. It takes requests from the user, remembers who they are (Session Management), and safely carries the request to the kitchen.
    
- **Quarkus (The Master Chef):** The core business logic container. It never talks to the customer directly. It securely processes passwords, enforces business rules, and gets ingredients.
    
- **PostgreSQL (The Refrigerator):** Where the data is securely stored.
    

### How Data Flows (Signup Example)

```
[ React Frontend (Browser) ]
         |
         | 1. User types email & password. Clicks Signup.
         v
[ Node.js (BFF & Session Manager) ]
         |
         | 2. Forwards email & password to Quarkus.
         v
[ Quarkus (Core Business API) ]
         |
         | 3. Hashes password. Generates verification token.
         v
[ PostgreSQL (Database) ]
```

_Note on Latency:_ While it seems like a "double API call" would be slow, the jump from Node to Quarkus happens inside the same AWS server. It takes 1-2 milliseconds. It gives us massive security and organizational benefits.

## 3. Technology Breakdown

### A. React (Frontend)

- **What it is:** A library for building web pages.
    
- **Why it exists:** Before React, updating a web page was messy and slow. React lets us build screens using small, reusable pieces called components. It updates the screen instantly.
    

### B. Node.js (Middle Layer / BFF)

- **What it is:** A tool to run JavaScript on a server.
    
- **Why it exists:** It handles the "web mechanics". Node will manage sessions and cookies. This lets our core Java backend ignore web browsers and focus only on strict business logic.
    

### C. Quarkus (Core Backend Container)

- **What it is:** A modern Java framework built for the cloud.
    
- **Why it exists:** Older Java frameworks (like Spring Boot) are slow to start because they scan configuration files _while the server is starting_. Quarkus does this heavy lifting _while you are building the code on your laptop_.
    
- **"Kubernetes-Native":** Because Quarkus starts instantly and uses very little memory, it is perfect for modern cloud systems (like Kubernetes), where tiny virtual computers are constantly being started and stopped.
    

### D. Maven

- **What it is:** A build tool for Java.
    
- **Why it exists:** Before Maven, engineers had to manually download code libraries from the internet. Maven automates this. You write a list of libraries you need, and Maven downloads them and builds your final application.
    

### E. PostgreSQL (Database)

- **What it is:** A strictly relational database.
    
- **Why it exists:** It stores data in rigid tables (like a spreadsheet) to ensure data is never corrupted or lost.
    

## 4. Security Concepts

Security is the most important part of this assignment.

### Password Hashing & Salts

- **Why it exists:** If a hacker steals your database, you do not want them to see user passwords.
    
- **How it works:** We never save the real password. We use a math function called **Hashing** (like bcrypt). It turns "myPassword123" into a long string of garbage text. You cannot reverse this text back into the password.
    
- **What is a Salt?:** Hackers have lists of pre-calculated hashes. To stop them, we generate a random string of text (a Salt) for every user. We add this Salt to the password before hashing it. This makes every hash unique.
    

### Sessions & Secure Cookies

- **Why it exists:** HTTP (the language of the internet) has no memory. It forgets the user after every click.
    
- **How it works:** When a user logs in, Node creates a "Session" (a memory box) and gives it an ID. Node sends this ID to the browser inside a small file called a **Cookie**.
    
- **Cookie Security:** * We use the `HttpOnly` flag so bad JavaScript cannot steal the cookie (prevents XSS attacks).
    
    - We use the `SameSite` flag so trick websites cannot force the user's browser to send the cookie (prevents CSRF attacks).
        

## 5. Database Design

We are using a Relational Database. Data is stored in Tables, which have Rows and Columns.

**The Users Table:**

- `id`: The **Primary Key**. A unique number for every user.
    
- `email`: The user's email. We add a **UNIQUE Constraint** here. If two people try to sign up with the exact same email, the database itself will block the second person.
    
- `password_hash`: The scrambled password.
    
- `is_verified`: A simple true/false (boolean) value to track if they validated their email.
    
- `verification_token`: A random string used to prove the user owns the email address.
    

**Connection Pooling:**

Opening a connection to a database is slow. Quarkus uses a Connection Pool. It opens a few connections when the server starts and keeps them open. When a request comes in, it simply borrows an open connection.

**Hibernate ORM:**

Java uses Objects. Databases use Tables. They do not understand each other. Hibernate is a translator. It takes a Java `User`object and automatically saves it as a row in the PostgreSQL `Users` table.

## 6. Testing

The interviewer wants to see if you write professional code. Untested code breaks production servers.

- **Unit Testing:** Testing the smallest piece of code in isolation. (Example: Testing if your password validation function rejects a password without a number).
    
- **Integration Testing:** Testing if two pieces of your system work together. (Example: Testing if Quarkus can successfully save a user into a test database).
    
- **End-to-End (E2E) Testing:** Testing the whole system like a real user. (Example: A script that automatically opens a browser, types an email, clicks "Signup", and checks if the success message appears).
    
- **Mocking:** Sometimes we fake parts of the system during a test. If we are testing Quarkus, we might "mock" the database so the test runs instantly without needing a real database running.
    

## 7. Deployment Plan

To share your work, you must host it. We will use **AWS EC2 (Elastic Compute Cloud)**.

1. **The Server:** An EC2 instance is a Virtual Machine (VM). It is a slice of a massive physical computer inside an Amazon warehouse.
    
2. **Ports:** We do not need multiple servers. One server can run multiple programs using Ports (numbered doors).
    
    - Door 3000 -> Node.js
        
    - Door 8080 -> Quarkus
        
    - Door 5432 -> PostgreSQL
        
3. **DNS (Domain Name System):** Computers talk using IP addresses (like phone numbers). DNS is the internet's phonebook. It translates a human name (like `your-app.com`) into the server's IP address so the browser can find it.
