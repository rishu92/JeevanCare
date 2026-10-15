# JeevanCare 🏥

**A Healthcare Consultation Platform**

JeevanCare is a web-based healthcare project designed to connect patients and doctors through a simple and accessible interface. It includes separate pages for patients, doctors, and administrators.

## ✨ Features

- **User Authentication:** Registration, login, and OTP verification interface.
- **Patient Dashboard:** Access patient profile and dashboard pages.
- **Doctor Profiles:** Browse doctor information and profiles.
- **Doctor Dashboard:** Dedicated interface for doctors.
- **Doctor Document Verification:** Support for doctor document submission and administrative review.
- **Consultation Management:** Consultation request workflow for patients and doctors.
- **Chat Interface:** Dedicated chat interface.
- **Emergency Assistance:** An emergency information and assistance page.
- **AI Assistant:** An interface for AI-assisted guidance.

*Feature availability depends on the current backend and database configuration.*

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Authentication:** Backend authentication and password hashing

## 📁 Project Structure

```text
JeevanCare/
├── assets/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── node_modules/
│   ├── middleware/
│   ├── routes/
│   └── addAdminRole.js
│   └── checkDoctorDocuments.js
│   └── createFirstAdmin.js
│   └── package-lock.json
│   └── package.json
│   └── server.js
├── css/
├── js/
├── node_modules/
├── server/
├── index.html
├──ai-assistant.html
├──chat.html
├──doctor-dashboard.html
├──doctor-documents.html
├──doctor-profile.html
├──otp.html
├──profile.html
├── login.html
├── register.html
├── dashboard.html
├── doctor.html
├── admin.html
├── emergency.html
├── package.json
└── README.md
```

## ⚙️ Setup

### Prerequisites

- Node.js and npm
- MySQL
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/rishu92/JeevanCare.git
   ```

2. Open the project folder:

   ```bash
   cd JeevanCare
   ```

3. Install dependencies in the relevant application directories using their respective `package.json` files.

4. Configure the required environment variables in local `.env` files. Do not upload credentials or secret keys to GitHub.

5. Configure the MySQL database and required tables according to the backend setup.

6. Start the relevant backend server using the scripts defined in its `package.json`.

7. Open the frontend using a local development server such as VS Code Live Server.

*Detailed database setup and startup commands can be added after verifying the project's current configuration.*

## 🔐 Security

- Keep database credentials and API keys in environment variables.
- Never commit `.env` files.
- Do not use real patient information for demonstrations or testing.

## 🚀 Project Status

JeevanCare is an academic software project under development. Local functionality and backend configuration should be verified before deployment.

## 👨‍💻 Author

**Rishu Raj**

B.Tech Computer Science and Engineering  
Galgotias University

## 📄 License

No license has been specified yet. Please contact the repository owner before reusing or redistributing this project.