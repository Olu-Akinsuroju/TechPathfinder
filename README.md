# Tech Path Advisor

## Overview

Welcome to the Tech Path Advisor, a sophisticated, full-stack application engineered to guide aspiring tech professionals toward their ideal career paths. This project leverages a dual-classification system—combining rule-based logic with advanced machine learning—to analyze user interests and recommend a tailored technology specialization. As the Solution Architect, I designed this system to be scalable, accurate, and insightful, transforming open-ended feedback into actionable career guidance.

## Table of Contents

- [Problem Solved](#problem-solved)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Problem Solved

Many individuals aspiring to enter the tech industry are overwhelmed by the sheer number of specializations available. They often have a general idea of their interests but struggle to connect them to a concrete career path like DevOps, Data Science, or AR/VR. The Tech Path Advisor bridges this gap by interpreting a user's free-text response from a survey and classifying it into a clear, understandable tech specialization. This solves the critical problem of translating passion into a tangible career direction.

## Key Features

- **Dual-Classification Engine**: Employs a hybrid AI model that first uses a rapid, rule-based "hard classifier" for common keywords and then escalates to a "soft classifier" (a Hugging Face zero-shot model) for nuanced, contextual analysis.
- **Google Sheets Integration**: The backend poller continuously fetches new survey responses from a specified Google Sheet, ensuring a seamless, automated workflow from data entry to classification.
- **RESTful API for Results**: A Flask-based API serves the latest classification result, allowing for a decoupled, modern frontend experience. The architecture is designed for scalability and easy integration with other services.
- **React-Based Frontend**: A clean, responsive user interface built with React that retrieves and displays the user's recommended tech path, providing a polished and intuitive user experience.
- **Solution-Oriented Architecture**: As the Solution Architect, I designed the system with modularity and scalability in mind. The decoupled frontend, backend API, and classification engine ensure that each component can be updated and maintained independently.

## Tech Stack

This project was built with a focus on creating a robust and scalable solution. The technologies were chosen to align with modern best practices and the specific goals of the application:

- **Backend**: Python, Flask, APScheduler
- **AI/ML**: Hugging Face Transformers (zero-shot classification), Pandas
- **Frontend**: React, Tailwind CSS, Vite
- **Data Source**: Google Sheets API
- **Deployment**: (Not specified, but designed for containerization, e.g., Docker)

## Installation

To get this project running locally, follow these steps.

### Prerequisites

- Python 3.8+
- Node.js & npm (or yarn)
- Google Cloud Project with Sheets API enabled
- Service Account credentials (JSON file)

### Backend Setup

1.  **Clone the repository**:
    `git clone https://github.com/your-username/tech-path-advisor.git`
    `cd tech-path-advisor`

2.  **Set up a virtual environment and install dependencies**:
    `python -m venv venv`
    `source venv/bin/activate`
    `pip install -r requirements.txt`

3.  **Configure environment variables**:
    Create a `.env` file in the `backend` directory and add the following:
    `SHEETS_SPREADSHEET_ID=your_spreadsheet_id`
    `GOOGLE_SERVICE_ACCOUNT_JSON=path/to/your/credentials.json`

### Frontend Setup

1.  **Navigate to the frontend directory**:
    `cd frontend`

2.  **Install dependencies**:
    `npm install`

## Usage

### Running the Application

1.  **Start the backend server**:
    `python backend/poller.py`

2.  **Start the frontend development server**:
    `npm run dev --prefix frontend`

Once both servers are running, you can open your browser to `http://localhost:5173` to view the application. The backend will automatically poll the Google Sheet for new entries, and the frontend will display the latest classification result.

## Contributing

Contributions are welcome! If you have ideas for improvements or find any issues, please open an issue or submit a pull request.

### Contribution Flow

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes and commit them (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/your-feature-name`).
5.  Open a Pull Request.

Please follow the existing code style and ensure that any new features are covered by tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

As the Solution Architect behind this project, I'm always open to discussing the design choices, architecture, or potential improvements.

- **GitHub**: [Your GitHub Profile](https://github.com/your-username)
- **Email**: [your.email@example.com](mailto:your.email@example.com)

---
*This README is currently in a draft state and will be finalized as the project evolves.*
