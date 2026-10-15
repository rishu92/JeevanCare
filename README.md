# JeevanCare 🏥

### A Healthcare Consultation Platform

JeevanCare is a web-based healthcare project designed to provide a platform for patients and doctors to interact through a simple and accessible interface. The project includes dedicated interfaces for patients, doctors, and administrators.

---

## 📸 Screenshots

### Homepage
![JeevanCare Homepage](screenshots/homepage.png)

### Patient Dashboard
![Patient Dashboard](screenshots/patient-dashboard.png)

### Doctor Listing
![Doctor Listing](screenshots/doctors.png)

### Doctor Dashboard
![Doctor Dashboard](screenshots/doctor-dashboard.png)

### Admin Panel
![Admin Panel](screenshots/admin-panel.png)

### Login Page
![Login Page](screenshots/login.png)

### Registration Page
![Registration Page](screenshots/register.png)

### Doctor Documents
![Doctor Documents](screenshots/doctor-documents.png)

### Chat Interface
![Chat Interface](screenshots/chat.png)

### Emergency Assistance
![Emergency Assistance](screenshots/emergency.png)

### AI Assistant
![AI Assistant](screenshots/ai-assistant.png)

---

## ✨ Features

- **User Authentication:** Registration, login, and OTP verification interface.
- **Patient Dashboard:** Dedicated dashboard and profile pages for patients.
- **Doctor Profiles:** Doctor listing and profile interface.
- **Doctor Dashboard:** Separate interface for doctors.
- **Doctor Document Verification:** Doctor document submission and administrative review workflow.
- **Consultation Management:** Consultation request functionality for patients and doctors.
- **Chat Interface:** Dedicated interface for communication.
- **Emergency Assistance:** Emergency information and assistance page.
- **AI Assistant:** Interface for AI-assisted guidance.
- **Admin Panel:** Administrative interface for managing platform workflows.

*Features requiring backend services or database access depend on the project's current configuration.*

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Authentication:** Backend authentication and password hashing
- **Version Control:** Git and GitHub

## 📁 Project Structure

```text
JeevanCare/
├── assets/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── addAdminRole.js
│   ├── checkDoctorDocuments.js
│   ├── createDoctorDocumentsTable.js
│   ├── createFirstAdmin.js
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
├── css/
├── js/
├── server/
├── screenshots/
├── index.html
├── admin.html
├── ai-assistant.html
├── chat.html
├── dashboard.html
├── doctor.html
├── doctor-dashboard.html
├── doctor-documents.html
├── doctor-profile.html
├── emergency.html
├── login.html
├── otp.html
├── profile.html
├── register.html
├── package.json
├── package-lock.json
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- MySQL Server
- [Visual Studio Code](https://code.visualstudio.com/)
- VS Code Live Server extension (for frontend development)

### 1. Clone the Repository

```bash
git clone https://github.com/rishu92/JeevanCare.git
```

### 2. Open the Project

```bash
cd JeevanCare
```

### 3. Install Dependencies

Install dependencies in the relevant application directories using their respective `package.json` files.

For the root project:

```bash
npm install
```

For the backend, if required:

```bash
cd backend
npm install
```

Return to the project root before running commands for other directories.

### 4. Configure Environment Variables

Create local `.env` files in the directories required by the application.

Configure the required database settings, such as:

```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
DB_PORT=3306
```

Use the actual variable names required by each server's configuration.

**Important:** Replace the example values with your own local configuration. Never upload real passwords, API keys, tokens, or `.env` files to GitHub.

### 5. Configure the Database

- Start your MySQL server.
- Create the database required by the application.
- Set the correct database name and credentials in the relevant environment file.
- Create the required tables according to the backend setup scripts and application code.

### 6. Run the Application

Start the appropriate backend server using the scripts defined in the relevant `package.json`.

For example, if the backend package defines a `start` script:

```bash
npm start
```

For frontend development, open the project in Visual Studio Code and use Live Server to run the relevant HTML page.

*The exact startup commands and ports depend on the current configuration of the root, backend, and server directories.*

## 🔐 Security and Privacy

- Keep database credentials and API keys in environment variables.
- Do not commit `.env` files or secret configuration.
- Do not include real patient records or sensitive personal information in screenshots.
- Use test data for demonstrations.
- Do not expose administrator credentials in the repository.

## 🚀 Project Status

JeevanCare is an academic software project under development. Its interfaces, backend services, and database configuration should be tested before deployment.

**Note:** This repository contains the project source code. It does not, by itself, host the application as a live website.

## 👨‍💻 Author

**Rishu Raj**

B.Tech Computer Science and Engineering  
Galgotias University

## 📄 License

No license has been specified for this repository. Contact the repository owner for permission before reusing or redistributing the project.