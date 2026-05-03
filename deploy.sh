#!/bin/bash
export PATH=/usr/local/share/google-cloud-sdk/bin:$PATH
echo "Deploying Indian Election Assistant to Google Cloud Run..."
gcloud run deploy election-assistant \
  --source . \
  --region us-central1 \
  --project promotwar1 \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=${GEMINI_API_KEY},NODE_ENV=production"
echo "Deployment complete!"
