# mementos-backend

## Overview
This is a Node.js-based API for managing a photography platform. It allows users to upload and select print styles for images. It allows for admin to retrieve and delete images, with support for cloud storage and a PostgreSQL database. The API includes user authentication and session management.

## Tech Stack
- **Node.js**: Backend runtime.
- **Express.js**: Web framework for building the API.
- **PostgreSQL**: Database for storing user and image data.
- **Cloud Storage**: For storing images (Cloudinary).
- **Joi**: For request validation.
- **pg**: PostgreSQL client for Node.js.

## Setup
run the npm install command to install the dependenies.
create a .env file from the .env.example file, and fill in the required API keys.
create a database in your DMBS. the table function will create the required tables auotomatically.

## API Endpoints
POST /users/loginUsers will login a user and save required details.
POST /tokens/refreshStaff refreshes the access tokens for the staff same applies for users.
POST /tokens/logoutStaff logs out a staff, or usuer.
POST /images/upload uploads and edits an image(requires authentication).
POST /users/validateEmail confirms the owner of an inputed email during initial login by sending an OTP to the email
POST /users/validateOtp verifies the OTP and logs in the user
POST /staff/signup does similar verification for staff
POST /verifySignupOtp verifies the OTP for staff
POST /staff/login the staff should be redirected to the login page upon successful OTP verification
POST /staff/resetPassword creates an OTP t help reset staff password, in the case of a forgotten password
POST /staff/verifyPasswordOtp verifies the OTP and gives room to input the new password. The staff can then be redirected to the login page
GET /images/gallery displays uploaded images to the admin and staff.
DELTE /images/delete deletes specified image(s) from the cloud and database.

## Development
"npm start" starts the server with nodemon.