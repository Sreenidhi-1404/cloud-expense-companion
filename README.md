


Cloud Expense Companion -- Smart Financial Cockpit
A MERN-style full-stack personal finance application with AI-assisted
receipt analysis and financial guidance.
Implementation note: This README reflects the architecture and
features discussed for this project. Verify exact model identifiers,
API methods, WebSocket behavior, and deployment status against the
current source before claiming them as completed features.

Contents
- Overview
- Features
- Technology stack
- Architecture
- Workflows
- Database
- Security
- Project structure
- Installation
- Environment variables
- Commands
- API overview
- Deployment
- Troubleshooting
- Presentation summary
Overview
Cloud Expense Companion helps users manage personal finances from one
dashboard. It supports expense and income records, category budgets,
savings goals, financial summaries, and AI-assisted features.

The project follows the MERN architecture: - M -- MongoDB Atlas:
cloud database - E -- Express.js: backend framework - R --
React.js: frontend library - N -- Node.js: backend runtime

TypeScript is used for application code.
Features
Authentication
- User registration and login.
- Password hashing with bcryptjs.
- JWT-based authentication for protected API requests.
Expense tracking
- Add, view, update, and delete expense records.
- Associate records with the signed-in user.
Income management
- Add, view, update, and delete income records.
Budget management
- Set and retrieve category-based spending limits.
- Compare recorded spending with budget limits.
Savings goals
- Create savings targets.
- Track current and target amounts.
- Update or delete goals.
AI receipt scanning
- User uploads or captures a receipt image.
- Backend sends the image for analysis using the Gemini API.
- AI can extract details such as merchant, amount, date, and category.
- User reviews the extracted information before saving it as an
  expense.
Important: Receipt analysis and saving are separate operations. A
successful scan does not mean the expense has been saved. The frontend
must submit the confirmed details to the expense API, and the backend
must successfully store the record in MongoDB.
AI financial assistant
The Gemini integration supports AI-assisted financial questions and
recommendations. Discussed assistant personas include Financial Advisor,
Strict Enforcer, Eco Specialist, and Wealth Strategist. The actual
prompts and behavior depend on the current backend implementation.
Dashboard and analytics
The dashboard is intended to display financial summaries and insights
such as monthly and cumulative spending, transaction counts, charts,
daily spending momentum, a financial health score, possible
recurring-subscription insights, and estimated carbon impact. These
depend on the current calculations and available data.
Other interface features
- Light/dark theme switching.
- Responsive styling.
- Quick expense presets.
- CSV export.
- Icons and interactive charts.
Technology stack
  Technology                          Purpose
  React.js                            Frontend components and user
interface

  TypeScript                          Static typing

  Node.js                             Backend JavaScript runtime

  Express.js                          REST API routes and middleware

  MongoDB Atlas                       Cloud persistence

  MongoDB Node.js Driver              Backend database connection

  Gemini API                          AI receipt analysis and AI
responses

  JWT (jsonwebtoken)                Authentication tokens

  bcryptjs                          Password hashing and verification

  Tailwind CSS v4                     UI styling

  Recharts                            Financial charts

  Lucide React                        Icons

  Vite                                Frontend development and build

  WebSockets                          Included in the discussed server
architecture; verify actual usage
Google Cloud Run                    Intended backend hosting option
JWT identifies an authenticated user through a signed token.
bcryptjs hashes passwords before storage. Recharts renders
charts in React. Gemini API lets the backend send supported inputs
to a pretrained Gemini model; this project does not train its own model.


Architecture
                 USER
                   |
                   v
       React + TypeScript Frontend
          (Vite, Tailwind CSS)
                   |
               HTTP / REST
                   |
                   v
        Node.js + Express Backend
           |         |         |
           v         v         v
       JWT and     Gemini    MongoDB
       bcryptjs     API       Atlas
           |         |         |
    Authentication  AI      Persistent
    and passwords  features   records


General request lifecycle
1. User interacts with a React component.
2. Frontend sends an HTTP request to an Express endpoint.
3. Protected requests include a JWT authorization header.
4. Express middleware validates the token.
5. Backend checks input and record ownership.
6. Backend reads from or writes to MongoDB, or calls Gemini for AI
   work.
7. Backend returns a response.
8. React updates the interface.
MongoDB credentials and the Gemini API key must remain server-side and
must never be exposed in browser code.
Workflows
1. Registration and login
User submits credentials
        |
        v
React sends request to Express
        |
        v
Backend validates input
        |
        v
bcryptjs hashes password
        |
        v
Account stored in MongoDB
        |
        v
Login credentials are verified
        |
        v
Backend issues JWT
        |
        v
Frontend sends token with protected requests
2. Expense creation
User enters expense
       |
       v
React calls POST /api/expenses
       |
       v
Express validates JWT and input
       |
       v
Backend checks user ownership
       |
       v
MongoDB stores expense
       |
       v
Response returned to React
       |
       v
Dashboard/expense list refreshes
3. Receipt scanning
User uploads receipt image
       |
       v
Frontend sends image to backend
       |
       v
Express receives image
       |
       v
Backend calls Gemini API
       |
       v
Gemini analyses image
       |
       v
Extracted details returned to frontend
       |
       v
User reviews and confirms
       |
       v
Expense creation API is called
       |
       v
MongoDB stores expense
       |
       v
Dashboard refreshes
The scan stage extracts information. The save stage creates the
financial record. If a scanned receipt does not appear, check whether
the save action ran, whether the expense API succeeded, whether MongoDB
contains the record, and whether the dashboard refreshed.
4. Budget workflow
1. User chooses a category and limit.
2. React submits the budget.
3. Express authenticates and validates the request.
4. MongoDB stores or updates the budget.
5. React displays the saved budget.
5. Savings-goal workflow
1. User enters a goal and target amount.
2. React submits the goal.
3. Express verifies the user and processes the request.
4. MongoDB stores the goal.
5. React displays the goal and progress.
6. AI chatbot workflow
1. User enters a question.
2. React sends it to the backend chat endpoint.
3. Express calls Gemini using a server-side API key.
4. Gemini generates a response.
5. Backend returns the response to React.



Database
Configured database name:

cloud_expense_companion

Collections:

  Collection        Purpose
  users           User account and authentication information
expenses        Expense records
incomes         Income records
budgets         Category budget limits
savings_goals   Savings targets and progress
Typical fields
These fields reflect the MongoDB helper discussed; confirm actual stored
documents and route validation.

users: _id, uid, email, passwordHash, displayName, role,
createdAt

expenses: _id, userId, title, amount, category, date,
description, createdAt

incomes: _id, userId, source, amount, category, date,
description, createdAt

budgets: _id, userId, category, monthlyLimit

savings_goals: _id, userId, name, targetAmount,
currentAmount, deadline, description, createdAt, updatedAt
Data ownership
Financial records must be associated with the authenticated user's ID.
The backend should derive or verify ownership using the validated JWT
identity, not trust a userId supplied by the browser.

The intended persistence provider is MongoDB Atlas. The Atlas-only
helper discussed for this project fails startup if Atlas cannot be
reached instead of silently switching to local JSON storage.
Security


JWT
- Backend verifies credentials at login.
- Backend signs a JWT using a server-side secret.
- Frontend sends the token in the Authorization header.
- Express verifies the token on protected routes.
Example header:
Authorization: Bearer YOUR_JWT_TOKEN
Password hashing
- Hash passwords with bcryptjs before saving.
- Verify login passwords using bcrypt comparison.
- Never store plaintext passwords.
- Never log passwords or tokens.
Production security checklist
- Validate request data.
- Verify JWTs on protected routes.
- Check record ownership for reads, updates, and deletes.
- Configure CORS for the real frontend domain.
- Use HTTPS.
- Give the MongoDB database user only the permissions it needs.
- Configure Atlas network access appropriately.
- Do not return password hashes or secrets in API responses.
- Keep credentials out of Git and browser bundles.
Project structure
The exact structure may differ. The following reflects the files
discussed:
cloud-expense-companion/
|
|-- components/
|   |-- AuthModal.tsx
|   |-- ...other UI components
|
|-- lib/
|   |-- auth.ts
|
|-- services/
|   |-- expenseService.ts
|
|-- server/
|   |-- mongodb.ts
|
|-- App.tsx
|-- server.ts
|-- index.html
|-- package.json
|-- vite.config.ts
|-- tsconfig.json
|-- index.css
|-- .env                 # Local secrets; do not commit
|-- .gitignore
  File                                Responsibility
  App.tsx                           Main React application and
dashboard state

  components/                       Reusable interface components

  services/expenseService.ts        Frontend API calls for financial
records

  lib/auth.ts                       Client authentication helpers and
token headers

  server.ts                         Express server, routes, middleware,
and AI endpoints

  server/mongodb.ts                 MongoDB Atlas connection and
collection helpers

  index.css                         Global styles and Tailwind setup

  vite.config.ts                    Vite configuration
package.json                      Dependencies and scripts
Prerequisites
- Node.js (a supported LTS release)
- npm
- Git
- MongoDB Atlas account and database user
- Gemini API key
- Code editor such as Visual Studio Code

Installation
1. Clone the repository
git clone YOUR_GITHUB_REPOSITORY_URL
cd cloud-expense-companion
2. Install dependencies
npm install
3. Create .env

Create the file in the project root:
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@YOUR_CLUSTER_HOST.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=cloud_expense_companion

GEMINI_API_KEY=YOUR_GEMINI_API_KEY

JWT_SECRET=YOUR_LONG_RANDOM_SECRET
ADMIN_SECRET_KEY=YOUR_ADMIN_SECRET

Replace all placeholders with your own values. Do not use the example
values as real credentials. URL-encode special characters in the MongoDB
username or password when required by the URI format.
4. Configure MongoDB Atlas
1. Sign in to MongoDB Atlas.
2. Open or create a cluster.
3. Create a database user with appropriate permissions.
4. Configure Network Access to allow your development machine.
5. Copy the Atlas driver connection string.
6. Replace the hostname, username, and password in MONGODB_URI.
7. Set the database name to cloud_expense_companion.
5. Run locally

npm run dev
Open the local URL printed in the terminal.
Environment variables
  Variable                            Purpose
  MONGODB_URI                       MongoDB Atlas connection string

  MONGODB_DB_NAME                   Database name;
cloud_expense_companion

  GEMINI_API_KEY                    Gemini API credential

  JWT_SECRET                        Secret used to sign and verify JWTs

  ADMIN_SECRET_KEY                  Server-side admin secret
VITE_API_URL                      Optional public backend base URL
when frontend and backend are
hosted separately
Only variables intentionally designed for browser exposure should use
the VITE_ prefix. Never put MongoDB credentials, Gemini keys, JWT
secrets, or admin secrets in a VITE_ variable.
Available commands
The project scripts discussed are:
npm run dev
npm run lint
npm run build
npm run start
  Command                             Purpose
  npm run dev                       Starts the development server using
tsx server.ts

  npm run lint                      Runs TypeScript checking
(tsc --noEmit)

  npm run build                     Builds the Vite frontend and
bundles the Express server
npm run start                     Runs dist/server.cjs
Before deployment:
npm run lint
npm run build
API overview
The following routes were present in the discussed project architecture.
Verify exact HTTP methods, request bodies, response shapes, and
authentication middleware in server.ts.

  Endpoint                 Purpose
  /api/expenses          Retrieve and create expenses
/api/expenses/:id      Update or delete an expense
/api/incomes           Retrieve and create income records
/api/incomes/:id       Update or delete income records
/api/budgets           Retrieve and save category budgets
/api/goals             Retrieve and create savings goals
/api/goals/:id         Update or delete a savings goal
/api/analyze-image     Analyse a receipt image using Gemini
/api/chat              AI chatbot request
/api/recommendations   AI-generated recommendations
/api/mongodb/status    MongoDB connection and collection status

Authentication endpoints also exist in the backend; check server.ts
for their exact paths.

Protected financial routes should verify the JWT and enforce user-level
data ownership.
Deployment
A suggested deployment architecture is Vercel for the React frontend,
Google Cloud Run for the Express backend, and MongoDB Atlas for the
database.
                 Users
                   |
                   v
              Vercel
          React + Vite frontend
                   |
              HTTPS API calls
                   |
                   v
           Google Cloud Run
          Node.js + Express API
              /          \
             v            v
       MongoDB Atlas   Gemini API
         Database       AI service


A. Prepare GitHub
Create a repository and push the project. Ensure .env is excluded.

Example .gitignore:
node_modules
dist
.env
.env.*
!.env.example
.vercel
Example Git commands:
git init
git add .
git commit -m "Initial project commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
B. Deploy frontend to Vercel
1. Sign in to Vercel using GitHub.
2. Choose Add New → Project.
3. Import the repository.
4. Select Vite as the framework when appropriate.
5. Set the correct root directory if the frontend is in a subdirectory.
6. Configure the frontend build and output settings.
7. Add VITE_API_URL with the deployed backend's public URL if the API
   service uses it.
8. Deploy and test the generated domain.
Typical Vite settings:

  Setting            Value
  Framework preset   Vite
Build command      npm run build (adjust for a frontend subdirectory)
Output directory   dist
Install command    npm install

Backend deployment warning: The discussed build script also bundles
server.ts into dist/server.cjs. A normal Vite static deployment does
not automatically run this Express server. Deploy the backend separately
or deliberately adapt it to Vercel Functions. Importing the repository
into Vercel does not automatically mean both frontend and backend are
deployed correctly.
C. Deploy backend to Google Cloud Run
1. Prepare a production-ready backend build and start command.
2. Ensure Express listens on the port provided by the platform.
3. Deploy the backend service.
4. Configure server-side environment variables in Cloud Run.
5. Add MONGODB_URI, MONGODB_DB_NAME, GEMINI_API_KEY,
   JWT_SECRET, and ADMIN_SECRET_KEY.
6. Configure CORS to allow the Vercel frontend domain.
7. Test the backend status route and protected APIs.
Do not put backend secrets in frontend Vercel variables.
D. Connect frontend and backend
Set the Vercel frontend environment variable:
VITE_API_URL=https://YOUR-CLOUD-RUN-BACKEND-URL
The frontend API helper must prepend this base URL to backend API paths.
Redeploy the frontend after changing environment variables.
E. Deployment verification
Test: - Registration and login - Protected API access - Create, view,
update, and delete expenses - Income operations - Budget operations -
Savings-goal operations - Receipt analysis - Saving an analysed receipt
as an expense - AI chat and recommendations - Dashboard refresh and
charts - Light/dark theme - CSV export

Confirm that new records appear in the correct MongoDB Atlas
collections.
Deployment considerations
- Configure Atlas network access for the deployed backend's outbound
  network. A local IP allowlist does not automatically permit Cloud
  Run or Vercel.
- Configure CORS for the deployed frontend origin.
- Make the backend listen on the platform-provided port.
- Vercel Functions have different runtime and connection-lifecycle
  constraints from a continuously running Express server.
- If WebSockets are used, verify hosting support and connection
  behavior before selecting a serverless backend.
- Keep MongoDB and Gemini credentials server-side.
Troubleshooting
MongoDB DNS/hostname error
Example:
querySrv ENOTFOUND _mongodb._tcp.YOUR_CLUSTER.mongodb.net
Possible causes: - Placeholder hostname was not replaced. - Cluster
hostname was copied incorrectly. - URI contains a typo. - DNS or network
connectivity is unavailable.

Copy the actual driver connection string from Atlas.
MongoDB index conflict
Example:
An existing index has the same name as the requested index
The requested index options conflict with an existing index. Inspect the
collection's indexes in Atlas and reconcile the definitions. Do not
delete collections or indexes without checking their purpose and
existing data.
Unauthorized API response
Possible causes: - User is not logged in. - JWT is missing or expired. -
Frontend does not send the Authorization header. - Backend signing and
verification secrets differ. - Authentication middleware or ownership
checks are incorrect.
Receipt scans but expense does not appear
Check: 1. Did the image reach /api/analyze-image? 2. Did Gemini return
extracted details? 3. Did the frontend display the details? 4. Did the
user confirm/save the expense? 5. Did the frontend call the expense
creation endpoint? 6. Did the backend return success? 7. Does the record
appear in the expenses collection? 8. Did the dashboard reload the
user's expense list?

Analysis and persistence are separate operations.
Dashboard does not update
Check the expense API response, authenticated user ID, MongoDB record's
userId, dashboard date filters, and whether frontend state or data is
refreshed after saving.
TypeScript or build errors
Run:
npm run lint
npm run build
Resolve reported errors before deployment.
Future improvements
- Automated recurring-expense detection.
- Better receipt extraction and validation.
- Budget-limit notifications.
- More detailed financial reports.
- Improved recurring-payment management.
- PDF report export.
- Additional security controls and audit logging.
- Automated frontend and backend tests.
- Improved accessibility and mobile experience.
