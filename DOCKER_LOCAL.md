# Local Docker Development Guide

This guide shows you how to run the Madsen Racing website using Docker with your local `.env` file.

## Prerequisites

- Docker and Docker Compose installed
- A valid `.env` file in the project root with your Contentful credentials

## Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Start the service** (foreground with logs):
   ```bash
   npm run docker:local
   ```

2. **Start in detached mode** (background):
   ```bash
   npm run docker:local-detached
   ```

3. **View logs**:
   ```bash
   npm run docker:local-logs
   ```

4. **Stop the service**:
   ```bash
   npm run docker:local-stop
   ```

### Option 2: Manual Docker Commands

1. **Build with environment variables**:
   ```bash
   docker build --build-arg $(cat .env | xargs) -t madsen-racing-local .
   ```

2. **Run with environment file**:
   ```bash
   docker run --env-file .env -p 4321:4321 --name madsen-racing-local madsen-racing-local
   ```

## Environment Variables

The Docker image will use these variables from your `.env` file:

```bash
# Required for Contentful integration
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_access_token
CONTENTFUL_PREVIEW_TOKEN=your_preview_token

# Optional
NODE_ENV=production
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run docker:local` | Build and run in foreground |
| `npm run docker:local-detached` | Build and run in background |
| `npm run docker:local-stop` | Stop and remove containers |
| `npm run docker:local-logs` | Follow container logs |
| `npm run docker:local-rebuild` | Force rebuild and restart |

## URLs

- **Direct access**: http://localhost:4321
- **With Nginx proxy** (optional): http://localhost:80

## Development Workflow

1. **Make changes** to your source code
2. **Rebuild and restart**:
   ```bash
   npm run docker:local-rebuild
   ```
3. **View the changes** at http://localhost:4321

## Using with Nginx Proxy (Optional)

For a more production-like setup with Nginx:

```bash
# Start with Nginx proxy
docker-compose --profile with-nginx up --build

# Access at http://localhost:80
```

## Troubleshooting

### Port Already in Use

If port 4321 is already in use:

```bash
# Stop existing container
docker stop madsen-racing-local
docker rm madsen-racing-local

# Or use different port
docker-compose up --build -p 4322:4321
```

### Environment Variables Not Working

1. **Verify your .env file exists**:
   ```bash
   ls -la .env
   ```

2. **Check the content**:
   ```bash
   cat .env
   ```

3. **Test with manual command**:
   ```bash
   docker run --env-file .env --rm -it madsen-racing-local env | grep CONTENTFUL
   ```

### Build Issues

1. **Clean build**:
   ```bash
   docker-compose down
   docker system prune -f
   npm run docker:local-rebuild
   ```

2. **Check build logs**:
   ```bash
   docker-compose build --no-cache
   ```

### Content Not Loading

If Contentful content isn't appearing:

1. **Check environment variables in container**:
   ```bash
   docker exec madsen-racing-local env | grep CONTENTFUL
   ```

2. **Check browser console** for JavaScript errors
3. **Check container logs** for Contentful API errors:
   ```bash
   docker logs madsen-racing-local
   ```

## Production vs Development

### Development Build
- Uses your local `.env` file
- Includes development logging
- Hot reloading (when using `npm run dev`)

### Production Build (Docker)
- Static build with Contentful data embedded
- Optimized for performance
- No Contentful API calls at runtime

## File Structure

```
madsen-racing/
├── .env                    # Your local environment variables
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile             # Multi-stage Docker build
├── nginx-local.conf       # Local Nginx config (optional)
└── DOCKER_LOCAL.md        # This guide
```

## Tips

1. **Always test locally** before deploying to production
2. **Use detached mode** for long-running development sessions
3. **Monitor logs** regularly to catch Contentful issues
4. **Clean up containers** when finished to free resources

## Next Steps

Once your local Docker setup is working:

1. Test all website functionality
2. Verify Contentful content is loading correctly
3. Check responsive design on different screen sizes
4. Proceed with deployment to production