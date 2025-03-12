# Task Management API

A robust task management API built with Node.js, Express, PostgreSQL, and Redis, deployed using Docker Swarm.

## Table of Contents
- [Local Development Environment Setup](#local-development-environment-setup)
- [Docker Compose Setup](#docker-compose-setup)
- [GitHub Workflows](#github-workflows)
- [Docker Swarm Deployment](#docker-swarm-deployment)
- [Architecture Overview](#architecture-overview)
- [Troubleshooting](#troubleshooting)

## Local Development Environment Setup

### Prerequisites
- Node.js 20.x
- npm 10.x
- Docker and Docker Compose
- Git

### Installation Steps
1. Clone the repository:
```bash
git clone https://github.com/yuciferr/devops-engineer-project.git
cd devops-engineer-project
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

## Docker Compose Setup

### Development Environment
1. Build and start the services:
```bash
docker compose up --build
```

### Testing Environment
1. Run the test suite:
```bash
docker compose -f docker-compose.test.yml up --build --exit-code-from test
```

### Production Environment
1. Build and start the production services:
```bash
docker compose -f docker-compose.prod.yml up --build
```

## GitHub Workflows

The project includes three main GitHub workflows:

### 1. CI Pipeline (.github/workflows/ci.yml)
- Triggered on push and pull requests to develop and main branches
- Steps:
  - Lint and format check
  - Build and test
  - Build and push Docker image (on successful merge)

### 2. CD Pipeline (.github/workflows/cd.yml)
- Triggered after successful CI pipeline
- Deploys to:
  - Staging environment (develop branch)
  - Production environment (main branch)

### 3. Monitoring (.github/workflows/monitoring.yml)
- Runs every 15 minutes
- Performs health checks
- Monitors resource usage

## Docker Swarm Deployment

### Infrastructure Setup
- Manager Node: AWS EC2
- Worker Node 1: AWS EC2
- Worker Node 2: AWS EC2

### Initial Swarm Setup
1. Initialize Swarm on manager node:
```bash
docker swarm init --advertise-addr 16.170.192.227
```

2. Join worker nodes using the token provided by the manager:
```bash
docker swarm join --token <WORKER-TOKEN> 16.170.192.227:2377
```

### Deployment Steps
1. On the manager node, create required secrets:
```bash
echo "your-postgres-password" | docker secret create postgres_password -
echo "your-redis-password" | docker secret create redis_password -
```

2. Deploy the stack:
```bash
docker stack deploy -c docker-compose.prod.yml task-management
```

3. Verify deployment:
```bash
docker stack ps task-management
```

### Scaling Services
```bash
docker service scale task-management_app=3
```

## Architecture Overview

### General Architecture

```mermaid
graph TB
    subgraph "Development Process"
        Dev[Developer] -->|Git Push| GitHub
        GitHub -->|Trigger| CICD[CI/CD Pipeline]
    end
    
    subgraph "CI/CD Pipeline"
        CICD --> CI[Continuous Integration]
        CI -->|Successful| CD[Continuous Deployment]
        CI --> Lint[Code Quality Check]
        CI --> Test[Automated Tests]
        CI --> Build[Docker Image Build]
        CD --> DeployStaging[Deploy to Staging]
        CD --> DeployProd[Deploy to Production]
    end
    
    subgraph "Infrastructure"
        DeployStaging --> StagingInfra[Staging Servers]
        DeployProd --> ProdInfra[Production Servers]
        
        subgraph "Docker Swarm Cluster"
            ProdInfra --> SwarmManager[Swarm Manager]
            SwarmManager --> SwarmWorker1[Swarm Worker 1]
            SwarmManager --> SwarmWorker2[Swarm Worker 2]
            SwarmManager --> SwarmWorkerN[Swarm Worker N]
        end
    end
    
    subgraph "Application Architecture"
        subgraph "Frontend Network"
            Nginx[Nginx Load Balancer]
            Nginx --> AppInstance1[Application Instance 1]
            Nginx --> AppInstance2[Application Instance 2]
            Nginx --> AppInstance3[Application Instance 3]
        end
        
        subgraph "Backend Network"
            AppInstance1 --> DB[(PostgreSQL)]
            AppInstance2 --> DB
            AppInstance3 --> DB
            AppInstance1 --> Cache[(Redis)]
            AppInstance2 --> Cache
            AppInstance3 --> Cache
        end
    end
    
    subgraph "Monitoring and Logging"
        Monitoring[Monitoring Workflow] --> HealthCheck[Health Check]
        Monitoring --> ResourceMonitoring[Resource Monitoring]
        Monitoring --> ServiceLogs[Service Logs]
    end
```

### CI/CD Pipeline

```mermaid
flowchart TD
    A[Code Change] -->|Git Push| B[GitHub Repository]
    B -->|Trigger| C[CI Workflow]
    
    subgraph "CI Workflow"
        C --> D[Lint and Format Check]
        D -->|Successful| E[Build and Test]
        E -->|Successful| F[Docker Image Build and Push]
    end
    
    F -->|Trigger| G[CD Workflow]
    
    subgraph "CD Workflow"
        G --> H{Branch Check}
        H -->|develop| I[Deploy to Staging]
        H -->|main| J[Deploy to Production]
        
        I --> K[SSH Connection to Staging Server]
        J --> L[SSH Connection to Production Server]
        
        K --> M[Create Docker Secrets - Staging]
        L --> N[Create Docker Secrets - Production]
        
        M --> O[Docker Stack Deploy - Staging]
        N --> P[Docker Stack Deploy - Production]
    end
    
    subgraph "Monitoring Workflow"
        Q[Manual Trigger] --> R[Health Check]
        R --> S[Production Resource Monitoring]
        R --> T[Staging Resource Monitoring]
    end
```

### Containerization and Orchestration

```mermaid
graph TB
    subgraph "Docker Containerization"
        App[Node.js Application]
        Postgres[PostgreSQL Database]
        Redis[Redis Cache]
        Nginx[Nginx Reverse Proxy]
    end
    
    subgraph "Docker Swarm Orchestration"
        SwarmManager[Swarm Manager Node]
        SwarmWorker1[Swarm Worker Node 1]
        SwarmWorker2[Swarm Worker Node 2]
        
        SwarmManager -->|Manages| SwarmWorker1
        SwarmManager -->|Manages| SwarmWorker2
        
        subgraph "Services"
            AppService[App Service - 3 Replicas]
            NginxService[Nginx Service - 2 Replicas]
            PostgresService[PostgreSQL Service]
            RedisService[Redis Service]
        end
        
        SwarmManager -->|Manages| AppService
        SwarmManager -->|Manages| NginxService
        SwarmManager -->|Manages| PostgresService
        SwarmManager -->|Manages| RedisService
    end
    
    subgraph "Networks"
        FrontendNetwork[Frontend Network - Overlay]
        BackendNetwork[Backend Network - Overlay, Internal]
        
        NginxService -->|Connected| FrontendNetwork
        AppService -->|Connected| FrontendNetwork
        AppService -->|Connected| BackendNetwork
        PostgresService -->|Connected| BackendNetwork
        RedisService -->|Connected| BackendNetwork
    end
    
    subgraph "Volumes"
        PostgresVolume[PostgreSQL Data Volume]
        RedisVolume[Redis Data Volume]
        
        PostgresService -->|Uses| PostgresVolume
        RedisService -->|Uses| RedisVolume
    end
```

### Environments

```mermaid
graph LR
    subgraph "Development Environment"
        DevEnv[Local Development]
        DevDocker[Docker Compose]
        DevEnv -->|Uses| DevDocker
    end
    
    subgraph "Test Environment"
        TestEnv[CI Test Environment]
        TestDocker[Docker Compose Test]
        TestEnv -->|Uses| TestDocker
    end
    
    subgraph "Staging Environment"
        StagingEnv[Staging Server]
        StagingSwarm[Docker Swarm]
        StagingStack[Task Management Staging Stack]
        
        StagingEnv -->|Runs| StagingSwarm
        StagingSwarm -->|Manages| StagingStack
    end
    
    subgraph "Production Environment"
        ProdEnv[Production Servers]
        ProdSwarm[Docker Swarm Cluster]
        ProdStack[Task Management Production Stack]
        
        ProdEnv -->|Runs| ProdSwarm
        ProdSwarm -->|Manages| ProdStack
    end
    
    DevEnv -->|Code Push| TestEnv
    TestEnv -->|Successful Test| StagingEnv
    StagingEnv -->|Approval| ProdEnv
```

### Monitoring and Logging

```mermaid
graph TB
    subgraph "Monitoring System"
        HealthCheck[Health Check Endpoint]
        ResourceMonitoring[Resource Usage Monitoring]
        ServiceLogs[Service Logs]
        
        GithubActions[GitHub Actions Monitoring Workflow]
        
        GithubActions -->|Checks| HealthCheck
        GithubActions -->|Monitors| ResourceMonitoring
        GithubActions -->|Collects| ServiceLogs
    end
    
    subgraph "Health Check"
        ProdHealth[Production Health Check]
        StagingHealth[Staging Health Check]
        
        HealthCheck --> ProdHealth
        HealthCheck --> StagingHealth
    end
    
    subgraph "Resource Monitoring"
        DockerServices[Docker Services Status]
        DockerNodes[Docker Node Status]
        DockerStats[Docker Statistics]
        
        ResourceMonitoring --> DockerServices
        ResourceMonitoring --> DockerNodes
        ResourceMonitoring --> DockerStats
    end
    
    subgraph "Log Management"
        AppLogs[Application Logs]
        NginxLogs[Nginx Logs]
        DBLogs[Database Logs]
        
        ServiceLogs --> AppLogs
        ServiceLogs --> NginxLogs
        ServiceLogs --> DBLogs
    end
```

### Security

```mermaid
graph TB
    subgraph "Security Layers"
        SecretManagement[Docker Secrets Management]
        NetworkSecurity[Network Security]
        SSLCerts[SSL Certificates]
        AccessControl[Access Control]
    end
    
    subgraph "Docker Secrets"
        DBCredentials[Database Credentials]
        RedisPassword[Redis Password]
        APIKeys[API Keys]
        
        SecretManagement --> DBCredentials
        SecretManagement --> RedisPassword
        SecretManagement --> APIKeys
    end
    
    subgraph "Network Security"
        InternalNetwork[Internal Network]
        ExternalNetwork[External Network]
        
        NetworkSecurity --> InternalNetwork
        NetworkSecurity --> ExternalNetwork
    end
    
    subgraph "SSL/TLS"
        NginxSSL[Nginx SSL Termination]
        CertRenewal[Certificate Renewal]
        
        SSLCerts --> NginxSSL
        SSLCerts --> CertRenewal
    end
    
    subgraph "Access Control"
        SSHKeys[SSH Keys]
        GithubSecrets[GitHub Secrets]
        
        AccessControl --> SSHKeys
        AccessControl --> GithubSecrets
    end
```

## Troubleshooting

### Common Issues and Solutions

1. **Database Connection Issues**
   - Verify PostgreSQL credentials in .env file
   - Check if PostgreSQL container is running: `docker ps`
   - Ensure proper network connectivity: `docker network ls`

2. **Redis Connection Issues**
   - Verify Redis password in .env file
   - Check Redis container logs: `docker logs <redis-container-id>`

3. **Docker Swarm Issues**
   - Check node status: `docker node ls`
   - Verify service logs: `docker service logs task-management_app`
   - Ensure proper network overlay: `docker network inspect task-management_backend`

4. **CI/CD Pipeline Failures**
   - Check GitHub Actions logs for detailed error messages
   - Verify environment secrets are properly set in GitHub repository
   - Ensure proper permissions for GitHub Actions

### Health Checks
- Application: `http://<host>/health`
- PostgreSQL: Check container health status
- Redis: Monitor memory usage and connections

For additional support or issues, please create a GitHub issue or contact the maintainers.