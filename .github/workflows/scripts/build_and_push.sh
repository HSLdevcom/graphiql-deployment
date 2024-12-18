#!/usr/bin/env bash
set -e

DOCKER_IMAGE="hsldevcom/graphiql"
DOCKER_TAG=${DOCKER_BASE_TAG:-latest}

COMMIT_HASH=$(git rev-parse --short "$GITHUB_SHA")

DOCKER_TAG_LONG=$DOCKER_TAG-$(date +"%Y-%m-%dT%H.%M.%S")-$COMMIT_HASH
DOCKER_IMAGE_TAG=$DOCKER_IMAGE:$DOCKER_TAG
DOCKER_IMAGE_TAG_LONG=$DOCKER_IMAGE:$DOCKER_TAG_LONG

# Build image
echo "Building image: graphiql-deployment"
docker build --tag="$DOCKER_IMAGE_TAG_LONG" \
  --build-arg VITE_API_SUBSCRIPTION_KEY_PARAM="$VITE_API_SUBSCRIPTION_KEY_PARAM" \
  --build-arg VITE_API_SUBSCRIPTION_KEY="$VITE_API_SUBSCRIPTION_KEY" \
  --build-arg VITE_DEV_API_SUBSCRIPTION_KEY="$VITE_DEV_API_SUBSCRIPTION_KEY" .

docker login -u "$DOCKER_USER" -p "$DOCKER_AUTH"
echo "Pushing image: $DOCKER_TAG"
docker push "$DOCKER_IMAGE_TAG_LONG"
docker tag "$DOCKER_IMAGE_TAG_LONG" "$DOCKER_IMAGE_TAG"
docker push "$DOCKER_IMAGE_TAG"

echo Build completed
