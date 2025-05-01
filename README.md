# OasisReserve

OasisReserve is a reservation management system for customers and services. It includes an admin dashboard and user-friendly interfaces for managing reservations.

## Features

- Add, edit, and delete customers and services.
- Make and manage reservations.
- Separate admin and user dashboards.
- Responsive design using Tailwind CSS.

## Prerequisites

- Node.js and npm installed.
- MongoDB database.

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/OasisReserve.git
   cd OasisReserve/Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `Backend` directory and add the following:
   ```properties
   MONGO_URI='your_mongodb_connection_string'
   PORT=8000
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open the application in your browser at `http://localhost:8000`.

## Folder Structure

- `Backend/`: Contains the server-side code.
- `Backend/public/`: Contains the frontend HTML, CSS, and JavaScript files.
- `Backend/models/`: Mongoose models for MongoDB collections.
- `Backend/routes/`: Express routes for API endpoints.

## License

This project is licensed under the MIT License.