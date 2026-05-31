FROM node:20-alpine

WORKDIR /app

# Copy package configurations first to leverage Docker layer caching
COPY package.json package-lock.json /app/

# Install Node dependencies
RUN npm install

# Copy the rest of the application files
COPY . /app/

# Expose Vite development port
EXPOSE 5173

# Run Vite dev server bound to 0.0.0.0 to allow access outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
