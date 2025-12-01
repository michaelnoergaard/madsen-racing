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
   - `ghcr.io/michaelnoergaard/madsen-racing:latest` (main branch)
   - `ghcr.io/michaelnoergaard/madsen-racing:main-<commit-sha>` (specific commits)
   - `ghcr.io/michaelnoergaard/madsen-racing:pr-<number>` (pull requests)

## Required Setup

### GitHub Container Registry (No Setup Required!)

This workflow uses **GitHub Container Registry** which requires no additional configuration:
- ✅ **No secrets to configure** - uses GitHub's built-in authentication
- ✅ **No external accounts** - integrated directly with your GitHub repository
- ✅ **Automatic permissions** - works with your existing GitHub access

The images will be automatically available at: `ghcr.io/michaelnoergaard/madsen-racing`

## Running the Docker Image

```bash
# Pull the latest image
docker pull ghcr.io/michaelnoergaard/madsen-racing:latest

# Run the container
docker run -p 4321:4321 ghcr.io/michaelnoergaard/madsen-racing:latest

# Run with volume for persistent data (if needed)
docker run -p 4321:4321 -v $(pwd)/data:/app/data ghcr.io/michaelnoergaard/madsen-racing:latest
```

## Development

### Local Build

```bash
# Build the Docker image locally
docker build -t madsen-racing .

# Run locally
docker run -p 4321:4321 madsen-racing

# Or pull and run the built image from GitHub
docker pull ghcr.io/michaelnoergaard/madsen-racing:latest
docker run -p 4321:4321 ghcr.io/michaelnoergaard/madsen-racing:latest
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