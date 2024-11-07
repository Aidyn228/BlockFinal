// index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs'); // Import fs module
const path = require('path'); // Import path module if not already
const crypto = require('crypto'); // Import crypto module

const { storageContract } = require('./contract');
const StorageOffering = require('./models/StorageOffering');
const StorageAgreement = require('./models/StorageAgreement');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB (run mongod in cmd)
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

// Create an HTTP server
const server = http.createServer(app);

// Attach socket.io to the server
const io = socketIo(server);

// Start the server on port 3000
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// In-memory storage for providers
let providers = {};

// Handle socket.io connections
io.on('connection', (socket) => {
  console.log('Provider connected:', socket.id);

  // Handle provider registration
  socket.on('provider_registration', (data) => {
    const { providerAddress, availableStorage } = data;
    // Store provider info
    providers[socket.id] = {
      socket: socket,
      providerAddress: providerAddress,
      availableStorage: availableStorage,
    };
    console.log(`Provider registered: ${providerAddress}, Available Storage: ${availableStorage} GB`);
  });

  // Handle file stored acknowledgment
  socket.on('file_stored', (data) => {
    const { agreementId, fileId, providerAddress } = data;
    console.log(`File stored by provider ${providerAddress}, Agreement ID: ${agreementId}, File ID: ${fileId}`);
    // You can update the database or perform other actions here
  });

  // Handle storage errors
  socket.on('storage_error', (data) => {
    const { agreementId, fileId, providerAddress, error } = data;
    console.error(`Error storing file on provider ${providerAddress}: ${error}`);
    // Handle the error accordingly
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Provider disconnected:', socket.id);
    // Remove provider from the list
    delete providers[socket.id];
  });
});

// ... (Event listeners and API endpoints will be added here)

// Listen to OfferingCreated events
storageContract.events.OfferingCreated()
  .on('data', async (event) => {
    const { offeringId, provider, capacity, pricePerGBPerDay } = event.returnValues;
    try {
      const newOffering = new StorageOffering({
        offeringId,
        provider,
        capacity,
        pricePerGBPerDay,
        isAvailable: true,
      });
      await newOffering.save();
      console.log(`Offering created with ID: ${offeringId} by provider: ${provider}`);
    } catch (error) {
      console.error('Error handling OfferingCreated event:', error);
    }
  })
  .on('error', (error) => {
    console.error('Error in OfferingCreated event listener:', error);
});


// Listen to OfferingUpdated events
storageContract.events.OfferingUpdated()
  .on('data', async (event) => {
    const { offeringId, provider, capacity, pricePerGBPerDay } = event.returnValues;
    try {
      await StorageOffering.findOneAndUpdate(
        { offeringId },
        { capacity, pricePerGBPerDay },
        { new: true }
      );
      console.log(`Offering updated with ID: ${offeringId} by provider: ${provider}`);
    } catch (error) {
      console.error('Error handling OfferingUpdated event:', error);
    }
  })
  .on('error', (error) => {
    console.error('Error in OfferingUpdated event listener:', error);
});


// Listen to OfferingRemoved events
storageContract.events.OfferingRemoved()
  .on('data', async (event) => {
    const { offeringId, provider } = event.returnValues;
    try {
      await StorageOffering.findOneAndUpdate(
        { offeringId },
        { isAvailable: false }
      );
      console.log(`Offering removed with ID: ${offeringId} by provider: ${provider}`);
    } catch (error) {
      console.error('Error handling OfferingRemoved event:', error);
    }
  })
  .on('error', (error) => {
    console.error('Error in OfferingRemoved event listener:', error);
});


// Listen to AgreementCreated events
storageContract.events.AgreementCreated()
  .on('data', async (event) => {
    const {
      agreementId,
      consumer,
      provider,
      capacity,
      totalPrice,
      startTime,
      endTime,
    } = event.returnValues;
    try {
      const durationInDays = (endTime - startTime) / (24 * 60 * 60);
      const pricePerGBPerDay = totalPrice / (capacity * durationInDays);
      const agreement = new StorageAgreement({
        agreementId,
        consumer,
        provider,
        capacity,
        pricePerGBPerDay,
        totalPrice,
        startTime,
        endTime,
        isActive: true,
      });
      await agreement.save();
      console.log(`Agreement created with ID: ${agreementId}`);
    } catch (error) {
      console.error('Error handling AgreementCreated event:', error);
    }
  })
  .on('error', (error) => {
    console.error('Error in AgreementCreated event listener:', error);
});

/* Listen to PaymentMade events
storageContract.events.PaymentMade()
  .on('data', async (event) => {
    const { agreementId, amount } = event.returnValues;
    try {
      // Optionally, update the agreement with payment information
      console.log(`Payment made for Agreement ID: ${agreementId}, Amount: ${amount}`);
      // You can store this payment record in MongoDB if needed
    } catch (error) {
      console.error('Error handling PaymentMade event:', error);
    }
  })
  .on('error', (error) => {
    console.error('Error in PaymentMade event listener:', error);
}); 

// Listen to AgreementCompleted events
storageContract.events.AgreementCompleted()
  .on('data', async (event) => {
    const { agreementId } = event.returnValues;
    try {
      await StorageAgreement.findOneAndUpdate(
        { agreementId },
        { isActive: false }
      );
      console.log(`Agreement completed with ID: ${agreementId}`);
    } catch (error) {
      console.error('Error handling AgreementCompleted event:', error);
    }
  })
  .on('error', (error) => {
    console.error('Error in AgreementCompleted event listener:', error);
}); */

// Listen to AgreementCancelled events
storageContract.events.AgreementCancelled()
  .on('data', async (event) => {
    const { agreementId } = event.returnValues;
    try {
      await StorageAgreement.findOneAndUpdate(
        { agreementId },
        { isActive: false }
      );
      console.log(`Agreement cancelled with ID: ${agreementId}`);
    } catch (error) {
      console.error('Error handling AgreementCancelled event:', error);
    }
  })
  .on('error', (error) => {
    console.error('Error in AgreementCancelled event listener:', error);
});



// API Endpoints

app.get('/offerings', async (req, res) => {
    try {
      const offerings = await StorageOffering.find({ isAvailable: true });
      res.json(offerings);
    } catch (error) {
      console.error('Error fetching offerings:', error);
      res.status(500).json({ error: 'Error fetching offerings' });
    }
});

// Get all offerings by a provider
app.get('/offerings/provider/:account', async (req, res) => {
  const { account } = req.params;
  try {
    const offerings = await StorageOffering.find({ provider: account });
    res.json(offerings);
  } catch (error) {
    console.error('Error fetching offerings:', error);
    res.status(500).json({ error: 'Error fetching offerings' });
  }
});


app.get('/agreements', async (req, res) => {
    try {
      const agreements = await StorageAgreement.find();
      res.json(agreements);
    } catch (error) {
      console.error('Error fetching agreements:', error);
      res.status(500).json({ error: 'Error fetching agreements' });
    }
});

// Get agreements for a consumer
app.get('/agreements/consumer/:consumerAddress', async (req, res) => {
  const { consumerAddress } = req.params;
  try {
    const agreements = await StorageAgreement.find({ consumer: consumerAddress });
    res.json(agreements);
  } catch (error) {
    console.error('Error fetching consumer agreements:', error);
    res.status(500).json({ error: 'Error fetching consumer agreements' });
  }
});

app.get('/agreements/:id', async (req, res) => {
  const { id } = req.params;

  // Check if `id` is a valid number
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid agreement ID' });
  }

  try {
    const agreement = await StorageAgreement.findOne({ agreementId: id });
    if (agreement) {
      res.json(agreement);
    } else {
      res.status(404).json({ error: 'Agreement not found' });
    }
  } catch (error) {
    console.error('Error fetching agreement:', error);
    res.status(500).json({ error: 'Error fetching agreement' });
  }
});
  
app.post('/upload', upload.single('file'), async (req, res) => {
  const { walletAddress } = req.body;
  const file = req.file;

  try {
    // Process the file: encryption, fragmentation
    // For simplicity, we'll assume the file is a single fragment

    // Encrypt the file
    const encryptedFragment = encryptFile(file.path);

    // Generate a unique file ID
    const fileId = generateFileId();

    // Select a provider to store the file
    const selectedProvider = selectProvider();

    if (!selectedProvider) {
      return res.status(500).json({ error: 'No available providers' });
    }

    // Send the encrypted fragment to the provider
    selectedProvider.socket.emit('store_file', {
      agreementId: 'agreementId', // Replace with actual agreement ID
      fileId: fileId,
      encryptedFragment: encryptedFragment,
      originalFileName: file.originalname,
    });

    console.log(`Sent file fragment to provider ${selectedProvider.providerAddress}`);

    res.json({ message: 'File uploaded and distributed to provider' });
  } catch (error) {
    console.error('Error processing file upload:', error);
    res.status(500).json({ error: 'Error processing file upload' });
  }
});

// Encryption function
function encryptFile(filePath) {
  const data = fs.readFileSync(filePath);
  // For simplicity, we're not actually encrypting the file
  // In production, you should encrypt the data using a secure method
  return data.toString('base64');
}

// Generate a unique file ID
function generateFileId() {
  return crypto.randomBytes(16).toString('hex');
}

// Select a provider based on available storage
function selectProvider() {
  // For simplicity, select the first available provider
  // You can implement more advanced selection logic here
  const providerIds = Object.keys(providers);
  if (providerIds.length === 0) {
    return null;
  }
  return providers[providerIds[0]];
}

app.get('/agreements/provider/:providerAddress', async (req, res) => {
  const { providerAddress } = req.params;
  try {
    const agreements = await StorageAgreement.find({ provider: providerAddress });
    res.json(agreements);
  } catch (error) {
    console.error('Error fetching provider agreements:', error);
    res.status(500).json({ error: 'Error fetching provider agreements' });
  }
});