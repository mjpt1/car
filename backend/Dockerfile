# Use an official Node.js runtime as a parent image
# Using alpine for a smaller image size
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application's source code
COPY . .

# Your app binds to port 3001, so expose it
EXPOSE 3001

# Define the command to run your app
CMD [ "node", "src/app.js" ]
