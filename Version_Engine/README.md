# Version Engine

Version Engine is a project designed to handle job requests for various version control operations using Git. It consists of a producer service that listens for job requests and a worker service that processes these requests. The project supports four types of version control operations: COMMIT, ROLLBACK, BRANCH, and MERGE.

## Project Structure

```
Version_Engine
├── .gitignore
├── compose.yaml
├── producer
│   ├── .dockerignore
│   ├── .env
│   ├── Dockerfile
│   ├── package.json
│   └── producer.js
├── worker-git
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── package.json
│   ├── index.js
│   ├── handlers
│   │   ├── commit.js
│   │   ├── rollback.js
│   │   ├── branch.js
│   │   └── merge.js
│   └── utils
│       ├── database.js
│       ├── gitCommands.js
│       └── fileSystem.js
└── README.md
```

## Features

- **Job Types**: Supports COMMIT, ROLLBACK, BRANCH, and MERGE operations.
- **Session Management**: Each job includes a session ID to query the database and retrieve necessary information.
- **Docker Integration**: The project is containerized using Docker, allowing for easy deployment and scalability.
- **Database Interaction**: The project interacts with a database to save changes and retrieve files as needed.

## Setup Instructions

1. **Clone the Repository**: Clone this repository to your local machine.
2. **Install Dependencies**: Navigate to the `producer` and `worker-git` directories and run `npm install` to install the required dependencies.
3. **Configure Environment Variables**: Update the `.env` file in the `producer` directory with your database connection strings and any necessary API keys.
4. **Build Docker Images**: Run `docker-compose build` to build the Docker images for the producer and worker services.
5. **Start the Services**: Use `docker-compose up` to start the services. The producer will listen for job requests, and the worker will process them.

## Usage Guidelines

- Submit job requests to the producer service with the required job type and session ID.
- The worker service will process the job and execute the corresponding Git command.
- Responses will be sent back to the producer, which can then update the database with any changes.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.