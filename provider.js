// provider.js

const io = require('socket.io-client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const checkDiskSpace = require('check-disk-space').default; 

// Configuration
const SERVER_URL = 'http://localhost:3000'; // Replace with your server URL if different
const STORAGE_DIR = path.join(__dirname, 'storage'); // Directory to store files
const PROVIDER_ADDRESS = '0xf8d63f87E77Ae507855D82Fd1EEBAbCadCBf72df'; // Replace with the provider's wallet address

// Ensure the storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR);
}

// Function to get the root path based on the operating system
function getRootPath() {
  const platform = process.platform;
  if (platform === 'win32') {
    return 'C:/'; // Adjust if necessary
  } else {
    return '/';
  }
}

// Calculate available disk storage capacity (in GB)
async function getAvailableStorage() {
  try {
    const rootPath = getRootPath();
    const diskSpace = await checkDiskSpace(rootPath);
    const freeBytes = diskSpace.free;
    const freeGB = Math.floor(freeBytes / (1024 * 1024 * 1024));
    return freeGB;
  } catch (error) {
    console.error('Error checking disk space:', error);
    return 0; // Default to 0 if there's an error
  }
}

// Connect to the server
const socket = io(SERVER_URL);

// On connection
socket.on('connect', async () => {
  console.log('Connected to server');

  // Get available storage
  const availableStorage = await getAvailableStorage();

  // Send provider info to the server
  socket.emit('provider_registration', {
    providerAddress: PROVIDER_ADDRESS,
    availableStorage: availableStorage, // in GB
  });

  console.log(`Registered as provider with ${availableStorage} GB of available storage`);
});

// Listen for file storage requests
socket.on('store_file', async (data) => {
  const { agreementId, fileId, encryptedFragment, originalFileName } = data;

  try {
    // Define the file path
    const filePath = path.join(STORAGE_DIR, `${fileId}_${originalFileName}`);

    // Write the encrypted fragment to the file system
    fs.writeFileSync(filePath, encryptedFragment, 'base64');

    console.log(`Stored file fragment for Agreement ID: ${agreementId}, File ID: ${fileId}`);

    // Send acknowledgment to the server
    socket.emit('file_stored', {
      agreementId: agreementId,
      fileId: fileId,
      providerAddress: PROVIDER_ADDRESS,
    });
  } catch (error) {
    console.error('Error storing file fragment:', error);
    // Inform the server about the error
    socket.emit('storage_error', {
      agreementId: agreementId,
      fileId: fileId,
      providerAddress: PROVIDER_ADDRESS,
      error: error.message,
    });
  }
});

// Handle disconnection
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

// Handle errors
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
