# Use the official Node.js 14 image as the base image
FROM node:16-slim as development

# Set the working directory inside the container
WORKDIR /

RUN apt-get update && apt-get install -y procps && rm -rf /var/lib/apt/lists/*


# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that the Nest.js app will listen on
EXPOSE 3000

# Start the Nest.js app
CMD [ "npm", "run", "start:dev" ]


# Use the official Node.js 14 image as the base image
FROM node:16-slim as production

# Set the working directory inside the container
WORKDIR /

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that the Nest.js app will listen on
EXPOSE 3000

# Start the Nest.js app
CMD npx typeorm-ts-node-commonjs migration:run -d src/data-source.ts && node dist/main.js

