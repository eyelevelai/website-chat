# EyeLevel Chat Client

## Deployment

### Chat Files

**All** chat files are deployed to **s3://eyelevel-cdn**.

There 2 types of files in this project:
  - Third party files
  - EyeLevel chat client

#### Third Party Files

The third party files include:
  - **3rdparty.js**
  - **iframeResizer.min.js**
  - **showdown.min.js**
  - **iframeResizer.contentWindow.min.js**
  - **alert.mp3**
  - **phone.min.js**
  - **icomoon** files
  - **menu.png**

These third party files are stored in **s3://eyelevel-cdn/chat** and should never need to be modified or moved.

#### EyeLevel Chat Client Files

The EyeLevel chat client files include:
  - **agent.js**
  - **chat.css**
  - **eyelevel.js**

These files are stored in folders within **s3://eyelevel-cdn** corresponding to the deployment setup.

- Production: **s3://eyelevel-cdn/chat**.
  - The chat client will connect to the production backend
- Staging: **s3://eyelevel-cdn/staging**
  - The chat client will connect to the production backend
- Dev: **s3://eyelevel-cdn/dev**
  - The chat client will connect to the dev backend

### Doing a Deployment

When updating the chat client for a deployment environment, you must upload the modifed chat client files to the appropriate folder in s3.

- Production: **s3://eyelevel-cdn/chat**.
  - The chat client will connect to the production backend
- Staging: **s3://eyelevel-cdn/staging**
  - The chat client will connect to the production backend
- Dev: **s3://eyelevel-cdn/dev**
  - The chat client will connect to the dev backend

After uploading the modified chat client files, you **MUST ALSO** invalidate the cached version of the files in CloudFront.

The CloudFront distribution will be named `cdn.eyelevel.ai` and will have an origin of `eyelevel-cdn.s3`.

1. Click on the ID for the `cdn.eyelevel.ai` distribution
2. Go to **Invalidations** tab
3. Click the **Create invalidation** button
4. Enter the S3 paths for the modified files
  - Production example: /chat/eyelevel.js
  - Staging example: /staging/agent.js
  - Dev example: /dev/chat.css
5. Click the **Create invalidation** button

## Testing

Dedicated URLs have been created for each deployment environment at:

- Production: https://chat.eyelevel.ai
- Staging: https://chat.eyelevel.ai/staging
- Dev: https://chat.eyelevel.ai/dev