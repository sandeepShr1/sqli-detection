Please follow the following steps to run the server.

1. Add the .env file in root (bE folder)

   # Copy and paste below

   NODE_ENV=development

   # NODE_ENV=production

   APP_PORT=4000

   # DB Credentials

   DB_USERNAME=postgres
   DB_PASSWORD=
   DB_NAME=
   DB_HOST=localhost
   DB_PORT=5432

   # JWT

   JWT_SECRET_KEY=
   JWT_EXPIRY_IN=90d

   # Cloudinary Cred

   CLOUD_NAME= ""
   API_KEY= ""
   API_SECRET= ""

   # Google Mail Cred

   SMTP_HOST=smtp.gmail.com
   SMTP_PORT= 465
   SMTP_SERVICE=gmail
   SMTP_MAIL=
   SMTP_PASSWORD=
   SMTP_ADMIN_MAIL=

2. Run "npm i" or "npm install" in terminal to download the node_modules
3. Run "npm run start:dev" to run the project.
