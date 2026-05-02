#!/bin/bash
echo "Deploying Indian Election Assistant to Google Cloud Run..."
gcloud run deploy election-assistant \
  --source . \
  --region us-central1 \
  --project promotwar1 \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=${GEMINI_API_KEY}"
echo "Deployment complete!"
