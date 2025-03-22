# microURLs-Backend
microURLs Backend , NodeJS and MongoDB


## Setup Instructions for Docker

1. **Install Docker**: Make sure you have Docker installed on your machine. You can download it from [Docker's official website](https://www.docker.com/products/docker-desktop).

2. **Build the Docker Image**:
    ```sh
    docker build -t microurls-backend .
    ```

3. **Run the Docker Container**:
    ```sh
    docker run -d -p 8080:8080 --name microurls-backend-container microurls-backend
    ```

4. **Verify the Container is Running**:
    ```sh
    docker ps
    ```

5. **Access the Application**: Open your browser and go to `http://localhost:8080`.

6. **Stopping the Container**:
    ```sh
    docker stop microurls-backend-container
    ```

7. **Removing the Container**:
    ```sh
    docker rm microurls-backend-container
    ```

8. **Removing the Docker Image**:
    ```sh
    docker rmi microurls-backend
    ```