# Use the official Node.js image
FROM node:16

# Set working directory in the container
WORKDIR /app

# Install dependencies
COPY package.json /app/package.json
RUN npm install

# Copy the rest of the application code
COPY . /app

# Expose port
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]
