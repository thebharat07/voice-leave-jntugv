const {BlobServiceClient,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} = require( '@azure/storage-blob');

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER;

// Create Blob client
const blobServiceClient =
  BlobServiceClient.fromConnectionString(connectionString);

// Extract account name & key from connection string
const matches = connectionString.match(
  /AccountName=([^;]+);AccountKey=([^;]+);/
);

const accountName = matches[1];
const accountKey = matches[2];

const sharedKeyCredential = new StorageSharedKeyCredential(
  accountName,
  accountKey
);

const uploadAudioAndGetSAS = async (
  buffer,
  fileName,
  mimeType
) => {
  const containerClient =
    blobServiceClient.getContainerClient(containerName);

  // Ensure container exists
  // await containerClient.createIfNotExists({
  //   access: 'private',
  // });

  const blobClient =
    containerClient.getBlockBlobClient(fileName);

  // Upload audio
  await blobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: mimeType,
    },
  });

  // Generate SAS (valid for 1 hour)
  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName: fileName,
      permissions: BlobSASPermissions.parse('r'),
      expiresOn: new Date(Date.now() + 60 * 60 * 1000),
    },
    sharedKeyCredential
  ).toString();

  return `${blobClient.url}?${sasToken}`;
};

async function generateReadSAS(blobName) {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);
    
    // Check if it exists to debug path errors
    const exists = await blobClient.exists();
    if (!exists) throw new Error(`Blob ${blobName} does not exist in Azure`);

    const sasUrl = await blobClient.generateSasUrl({
        permissions: BlobSASPermissions.parse("r"),
        expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // 1 hour
    });
    return sasUrl;
}


module.exports = {uploadAudioAndGetSAS, generateReadSAS};