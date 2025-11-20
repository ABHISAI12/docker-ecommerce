# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first
# This leverages Docker's layer caching
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Your app binds to port 3000, so "expose" it
EXPOSE 3000

# Define the command to run your app
CMD [ "npm", "start" ]