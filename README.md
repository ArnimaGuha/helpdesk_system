# Customer Support Helpdesk and Ticketing System

A full-stack support ticket management web application built with Node.js, Express, SQLite, and EJS. It features a modern, responsive UI with smooth transitions and role-based access control for Clients, Support Agents, and Administrators.

## Features

- **Client Profile**:
  - Secure authentication (Login and Register)
  - Raise new support tickets categorized by domain (Technical or Billing)
  - Track real-time complaint status (Open, In Progress, Resolved)
  - View agent-provided solutions
  - Submit ratings and comments upon ticket resolution

- **Agent Profile**:
  - Domain-restricted views (sees only tickets matching their assigned domain)
  - Review client issue details and update ticket status
  - Provide solutions and inspect client feedback ratings

- **Admin Profile**:
  - Comprehensive analytics dashboard displaying total complaints, open/reported counts, solved counts, and average system rating
  - Total customer and agent counts
  - Complete feedback log tracking system-wide customer satisfaction

## Tech Stack

- **Backend**: Node.js, Express.js, Express-Session, Bcrypt
- **Database**: SQLite3 (Zero-configuration file-based database)
- **Templating Engine**: EJS (Embedded JavaScript Templates)
- **Frontend**: Bootstrap 5, Custom CSS with smooth CSS keyframe animations

## Project Directory Structure

```text
helpdesk-system/
│
├── public/
│   └── style.css
├── views/
│   ├── login.ejs
│   ├── register.ejs
│   ├── client_dashboard.ejs
│   ├── raise_issue.ejs
│   ├── agent_dashboard.ejs
│   ├── agent_ticket.ejs
│   └── admin_dashboard.ejs
├── database.js
├── server.js
├── package.json
└── helpdesk.db (Generated automatically)
```
## Installation and Setup:

- Clone or download this repository into your local machine.

- Open your terminal and navigate to the project directory
```text
Bash
cd helpdesk-system
```
Install the required dependencies:
```text
Bash
npm install express sqlite3 ejs express-session bcrypt
```
Start the Node.js server:
```text
Bash
node server.js
```
Open your web browser and navigate to:

```text
http://localhost:3000
```
## Default Credentials for Testing
The system automatically seeds an initial Administrator account on first launch:

Email: admin@helpdesk.com

Password: admin123

Step-by-Step Testing Workflow

Admin Login: Log in using the default admin credentials (admin@helpdesk.com / admin123) to view analytics metrics.

Client Registration & Workflow:

Navigate to the register page and create an account with the role set to Client.

Log in as the client, click Raise New Issue, and submit a ticket under the Technical or Billing domain.

Agent Registration & Workflow:

Register a new account with the role set to Agent and assign a domain (e.g., Technical).

Log in as the agent to view domain-specific tickets, open a ticket, provide a solution, and change the status to Resolved.

Client Feedback Loop:

Log back in as the client to view the solution provided by the agent.

Use the feedback form to rate the service from 1 to 5 and submit comments.

Admin Review:

Log back in as the admin to review updated ticket metrics, active user counts, and the comprehensive feedback log.
