# Docker Automated Build Setup

This repository is configured to automatically build Docker images on every push to the main branch.

## How It Works

1. **Trigger**: The workflow runs automatically when:
   - Code is pushed to the `main` branch
   - A pull request is created/updated against `main`
   - Manually triggered from the GitHub Actions tab

2. **Build Process**:
   - Builds a multi-stage Docker image for optimal size and security
   - Uses Node.js 18 Alpine as base
   - Generates tags for branch names, PR numbers, and latest
   - Creates a Software Bill of Materials (SBOM) for security

3. **Image Tags**:
   - `docker.io/michaelnoergaard/madsen-racing:latest` (main branch)
   - `docker.io/michaelnoergaard/madsen-racing:main-<commit-sha>` (specific commits)
   - `docker.io/michaelnoergaard/madsen-racing:pr-<number>` (pull requests)

## Required Setup

### 1. Docker Hub Credentials

Add these secrets to your GitHub repository settings:

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add the following repository secrets:

#### DOCKER_USERNAME
- Your Docker Hub username
- Example: `michaelnoergaard`

#### DOCKER_PASSWORD
- Your Docker Hub personal access token (NOT your password)
- Get one here: https://hub.docker.com/settings/security

### 2. Create Docker Hub Token (Recommended)

1. Log in to [Docker Hub](https://hub.docker.com)
2. Go to **Account Settings** → **Security**
3. Click **New Access Token**
4. Give it a descriptive name (e.g., `github-madsen-racing`)
5. Set appropriate permissions (read/write for your repositories)
6. Copy the generated token and use it as `DOCKER_PASSWORD`

### 3. Create Docker Hub Repository (if not exists)

The workflow expects a repository named `madsen-racing` in your Docker Hub account.
Create it at: https://hub.docker.com/repository/create

## Running the Docker Image

```bash
# Pull the latest image
docker pull michaelnoergaard/madsen-racing:latest

# Run the container
docker run -p 4321:4321 michaelnoergaard/madsen-racing:latest

# Run with volume for persistent data (if needed)
docker run -p 4321:4321 -v $(pwd)/data:/app/data michaelnoergaard/madsen-racing:latest
```

## Development

### Local Build

```bash
# Build the Docker image locally
docker build -t madsen-racing .

# Run locally
docker run -p 4321:4321 madsen-racing
```

### Environment Variables

The Docker image uses these environment variables:
- `NODE_ENV=production` (set automatically)

## Security Features

- **Multi-stage builds**: Minimizes final image size and attack surface
- **Non-root user**: Runs as `astro` user with UID 1001
- **SBOM generation**: Creates software bill of materials for security scanning
- **Docker Buildx**: Uses build cache for faster builds
- **Base image updates**: Uses official Node.js Alpine images

## Troubleshooting

### Build Fails
1. Check the GitHub Actions logs for specific error messages
2. Verify Docker Hub credentials are correct
3. Ensure the Docker Hub repository exists

### Image Pull Issues
1. Verify the image exists on Docker Hub
2. Check your Docker Hub credentials
3. Ensure you have proper network access

### Runtime Issues
1. Check the container logs: `docker logs <container-id>`
2. Verify port 4321 is not already in use
3. Ensure the build completed successfully

## Related Files

- `Dockerfile` - Multi-stage Docker build configuration
- `.dockerignore` - Files excluded from Docker build context
- `.github/workflows/docker-build.yml` - GitHub Actions workflow
- `ecosystem.config.cjs` - PM2 configuration (for production deployments)