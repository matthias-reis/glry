const listFiles = async () => {
  // Imports the Google Cloud client library
  const { Storage } = require('@google-cloud/storage');

  // Creates a client
  const storage = new Storage();

  const bucketName = 'cardamonchai-images';
  const prefix = 'test-ordner/small';

  // Lists files in the bucket, filtered by a prefix
  const [files] = await storage.bucket(bucketName).getFiles({ prefix });

  console.log('Files:');

  files.forEach(file => {
    console.log(file);
  });
};

listFiles();
