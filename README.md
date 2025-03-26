# COMP 4170 Final Project: Resume-Builder

## Developed by
- Kiana A01379028  
- Zalida A01375976  
- Celine A01309245  

## Tasks Completed by Each Team Member
- UI/UX Design template: https://www.figma.com/design/2wV3qBv0PFHVPTtiYY41RB/Resume-Builder?node-id=0-1
- This file is created and designed by Kiana, Zalida, and Celine
- Front-end coded by Kiana, Zalida, and Celine
- Back-end database schema and connection by Celine
- GitHub repository created by Celine: https://github.com/MeowCeline00/Resume-Builder
- Styling by Kiana and Zalida
- Final report written by Kiana and Zalida


##  Tech Stack
- Express.js
- Node.js
- PostgreSQL
- EJS (templating engine)
- HTML/CSS/JavaScript


##  How to Run the Application Locally

### 1. Clone the Repository
- ```bash
- git clone https://github.com/MeowCeline00/Resume-Builder.git
- cd Resume-Builder

### 2. Install Dependencies
- npm install

### 3. Set Up PostgreSQL
- Create a new PostgreSQL database: resume_builder
- Create a .env file in the root directory.
- You can use .env.example as a template.
- # Database Configuration
DB_HOST=localhost
DB_PORT=5000
DB_NAME=resume_builder
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password

# Server Configuration
PORT=3000
NODE_ENV=development

### 5. Set Up the Database Schema
- Use the SQL scripts inside the sql/ folder to create the necessary tables.
- psql -U your_postgres_username -d resume_builder -f sql/init.sql

### 6. Start the server
- npm run dev

### 7. Open the App in Your Browser
- http://localhost:3000