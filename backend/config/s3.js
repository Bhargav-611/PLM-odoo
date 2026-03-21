const { S3Client } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy_access_key',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy_secret_key'
    }
});

module.exports = s3Client;
