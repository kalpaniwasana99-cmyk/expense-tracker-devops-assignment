- Expense Tracker App -

                                      -Group Information- 

Student 1: Madushani Wijerathna - ITBNM-2313-0086 - Role: DevOps Engineer

Student 2: Priyashani Amarathilaka - ITBNM-2313-0002 - Role: Frontend Developer

Student 3: Hasini Dilakshi - ITBNM-2313-0017 - Role: Backend Developer



                                        -Project Description- 

This is a web application that helps users track their daily expenses, manage their finances, and maintain monthly budget limits. It uses Firebase Firestore for real-time data updates and sends automatic alerts when spending exceeds the set budget.

This application has now been fully containerized using Docker to ensure a consistent environment across development, testing, and production.

                                        -Live Deployment- 

 Live URL: https://kalpaniwasana99-cmyk.github.io/expense-tracker-devops-assignment/
 

                                        -Technologies Used- 

Frontend: HTML5, CSS3, JavaScript (ES6 Modules)

Backend & DB: Google Firebase Firestore

Authentication: Firebase Auth

CI/CD: GitHub Actions

Deployment: Vercel

Tunneling: Ngrok (Used for local testing)

Containerization: Docker, Docker Compose, Nginx 


                                        -Features- 

Add/Delete Transactions: Add daily expenses and delete unwanted data in real-time.

Monthly Budgeting: Set a monthly spending limit.

Financial Goal Tracking: Users can set a financial goal, enter the target amount, and update their "Saved Amount" to track progress.

Visual Alerts & Notifications: Instant red alerts appear when spending exceeds the monthly budget.

Recent History Overview: View the last 10 transactions directly on the dashboard (Optimized Query).

Export to PDF: Download full expense reports as PDF files at any time.

Responsive User Interface: Fully optimized design for both mobile phones and desktops.


                                        -Branch Strategy-

We followed a professional Git branching workflow:

main: Production-ready code (Protected).

develop: Integration branch for merging features.

feature: Individual branches for specific features.


                                        -Individual Contributions-

    DevOps Engineer - Madushani Wijerathna ----

Repository Management: Created the GitHub repository and managed team collaborations.

Branch Protection: Set up branch protection rules and maintained a clean Git workflow.

Cloud Deployment & CI/CD: Configured GitHub Actions and Vercel for automated deployments.

Local Tunneling: Set up Ngrok to test Firebase Authentication and real-time features locally.

Database Performance: Enabled Composite Indexes in Firestore to reduce data loading latency.

Dockerization: Wrote the Dockerfile and managed container security configurations.



    Frontend Developer - Priyashani Amarathilaka ----

UI/UX Implementation: Designed a responsive dashboard using Inter fonts and Font-Awesome icons.

Frontend Logic: Developed JavaScript logic for adding/deleting expenses and checking budget limits.

Real-time UI Syncing: Used onSnapshot to update the UI instantly without page reloads.

Visual Alerts: Created visual states and alert messages for budget exceedances.

Documentation: Maintained the project README.md and user documentation.

Image Optimization: Implemented multi-stage builds to reduce Docker image size.


    Backend Developer - Hasini Dilakshi ----

Database Architecture: Designed collections for expenses, budgets, and goals in Firestore.

Query Optimization: Implemented limit(10) and orderBy to improve data fetching speed.

Data Integrity: Used serverTimestamp() to ensure accurate data ordering.

Goal Tracking Feature: Developed the backend logic for saving and calculating progress for financial goals.

Collaboration: Managed feature branches and performed code reviews on team pull requests.

Orchestration: Developed the docker-compose.yml file and configured service networking.


                                        -Setup & Docker Build Instructions-

1. Prerequisites

Git: Required for version control.

Docker Desktop: Required to build and run the containerized application.

(Since this application is containerized, local installations of Node.js and NPM are no longer required)

2. Repository Cloning & Installation

git clone https://github.com/kalpaniwasana99-cmyk/expense-tracker-devops-assignment.git
cd expense-tracker-devops-assignment

3. Firebase Configuration

Since this is a client-side application served via Nginx, Firebase credentials must be present in the source code before Docker builds the image.

Ensure a firebase-config.js file exists in the root folder with the following:

    Initialize App: initializeApp(firebaseConfig).

    Persistence: enableIndexedDbPersistence(db) enabled for offline support.

(This file is excluded from GitHub via .gitignore for security but will be copied into the container during the docker-compose build step.)


4. Running the Containerized Application 

To build the Docker image and start the container, run the following command in your terminal:

    docker-compose up -d --build

    Once the terminal shows "Started", open your web browser and access the application at:  http://localhost:8080

To gracefully stop the application, run: docker-compose down


5. Database Indexing & Docker Context

Firestore Index: 
The following Composite Index is required in Firestore for the dashboard:

Collection ID: expenses
Fields Indexed: uid (Ascending) and timestamp (Descending).


Build Context:
We have configured a .dockerignore file to exclude .git, README.md, and other unnecessary development files from the Docker build context to optimize image size and security.


6. Cloud Deployment & Local Tunneling

    Cloud Deployment: Automated via GitHub Actions to Vercel upon pushing to the main branch. 

    Local Tunneling (With Docker): If you need to test Firebase Authentication locally with the containerized app, establish a secure tunnel pointing to the Docker port: ngrok http 8080



                                        -Challenges Faced & Troubleshooting -

Syncing Backend & Frontend: Initially, there were issues connecting the Firestore listener with the Auth state, which we resolved by optimizing the loading sequence.

Local Testing: We couldn't test Firebase features locally without a secure connection, so we implemented Ngrok to create a secure tunnel. (When running locally in Docker, map Ngrok to port 8080 using ngrok http 8080).

Firestore Indexing: Complex queries caused delays, we solved this by creating Composite Indexes in the Firestore console.

Docker Port Conflicts: If http://localhost:8080 does not work, check if another service is using port 8080. You can change the port mapping in docker-compose.yml from "8080:80" to "8081:80".


