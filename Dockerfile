
ARG NODE_VERSION=24.14.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
# ENV NODE_ENV production


WORKDIR /app

COPY package*.json ./

# install dependencies
RUN npm install

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 6001

# Run the application.
CMD ["npm", "start"]
