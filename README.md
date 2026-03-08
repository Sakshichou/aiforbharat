Civic-Trust: Verified Civic Reporting Platform
Civic-Trust is a full-stack decentralized reporting application designed to bridge the gap between citizens and municipal authorities. It utilizes a serverless cloud architecture to provide real-time, verifiable civic data.

Technical Architecture
Frontend: React (Vite) with Tailwind CSS and Shadcn UI components.

Backend: FastAPI (Python) deployed as a serverless function on AWS Lambda (ap-south-1).

Database: PostgreSQL hosted on Supabase.

Middleware: Mangum adapter for AWS Lambda integration.

Key Features
Live Integrity Feed: Real-time fetching of civic reports directly from the Supabase database.

Hybrid Data Strategy: Utilizes a blend of live cloud data (via AWS) and local mock data for high availability and UI stability.

Officer Portal: Dedicated interface for authorities to review and manage pending civic issues.

Cross-Origin Security: Fully configured CORS headers on AWS to allow secure communication with the local development environment.

Installation and Setup
Clone the repository:
git clone https://github.com/Sakshichou/aiforbharat.git

Frontend Setup:
npm install
npm run dev

Backend Configuration:
The backend is hosted serverless on AWS. Local development requires a .env file with DATABASE_URL pointing to the Supabase instance.
