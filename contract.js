// contract.js
require('dotenv').config();
const Web3 = require('web3');

console.log(Web3.providers.WebsocketProvider); // Should log a function

const web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:7545"));


var contractABI = [{
  "anonymous": false,
  "inputs": [
    {
      "indexed": true,
      "internalType": "uint256",
      "name": "agreementId",
      "type": "uint256"
    }
  ],
  "name": "AgreementCancelled",
  "type": "event"
},
{
  "anonymous": false,
  "inputs": [
    {
      "indexed": true,
      "internalType": "uint256",
      "name": "agreementId",
      "type": "uint256"
    },
    {
      "indexed": true,
      "internalType": "address",
      "name": "consumer",
      "type": "address"
    },
    {
      "indexed": true,
      "internalType": "address",
      "name": "provider",
      "type": "address"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "capacity",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "totalPrice",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "startTime",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "endTime",
      "type": "uint256"
    }
  ],
  "name": "AgreementCreated",
  "type": "event"
},
{
  "anonymous": false,
  "inputs": [
    {
      "indexed": true,
      "internalType": "uint256",
      "name": "offeringId",
      "type": "uint256"
    },
    {
      "indexed": true,
      "internalType": "address",
      "name": "provider",
      "type": "address"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "capacity",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "pricePerGBPerDay",
      "type": "uint256"
    }
  ],
  "name": "OfferingCreated",
  "type": "event"
},
{
  "anonymous": false,
  "inputs": [
    {
      "indexed": true,
      "internalType": "uint256",
      "name": "offeringId",
      "type": "uint256"
    },
    {
      "indexed": true,
      "internalType": "address",
      "name": "provider",
      "type": "address"
    }
  ],
  "name": "OfferingRemoved",
  "type": "event"
},
{
  "anonymous": false,
  "inputs": [
    {
      "indexed": true,
      "internalType": "uint256",
      "name": "offeringId",
      "type": "uint256"
    },
    {
      "indexed": true,
      "internalType": "address",
      "name": "provider",
      "type": "address"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "capacity",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "pricePerGBPerDay",
      "type": "uint256"
    }
  ],
  "name": "OfferingUpdated",
  "type": "event"
},
{
  "stateMutability": "payable",
  "type": "fallback",
  "payable": true
},
{
  "inputs": [],
  "name": "agreementCounter",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function",
  "constant": true
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "name": "agreements",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "agreementId",
      "type": "uint256"
    },
    {
      "internalType": "address payable",
      "name": "consumer",
      "type": "address"
    },
    {
      "internalType": "address payable",
      "name": "provider",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "capacity",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "pricePerGBPerDay",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "totalPrice",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "startTime",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "endTime",
      "type": "uint256"
    },
    {
      "internalType": "bool",
      "name": "isActive",
      "type": "bool"
    }
  ],
  "stateMutability": "view",
  "type": "function",
  "constant": true
},
{
  "inputs": [],
  "name": "offeringCounter",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function",
  "constant": true
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "name": "offerings",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "offeringId",
      "type": "uint256"
    },
    {
      "internalType": "address payable",
      "name": "provider",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "capacity",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "pricePerGBPerDay",
      "type": "uint256"
    },
    {
      "internalType": "bool",
      "name": "isAvailable",
      "type": "bool"
    }
  ],
  "stateMutability": "view",
  "type": "function",
  "constant": true
},
{
  "stateMutability": "payable",
  "type": "receive",
  "payable": true
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "_capacity",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "_pricePerGBPerDay",
      "type": "uint256"
    }
  ],
  "name": "createOffering",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "_offeringId",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "_capacity",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "_pricePerGBPerDay",
      "type": "uint256"
    }
  ],
  "name": "updateOffering",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "_offeringId",
      "type": "uint256"
    }
  ],
  "name": "removeOffering",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "_offeringId",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "_capacity",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "_durationInDays",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "_startTime",
      "type": "uint256"
    }
  ],
  "name": "acceptOffering",
  "outputs": [],
  "stateMutability": "payable",
  "type": "function",
  "payable": true
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "_agreementId",
      "type": "uint256"
    }
  ],
  "name": "cancelAgreement",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}
];
  
var contractAddress = '0xf8d63f87E77Ae507855D82Fd1EEBAbCadCBf72df';  
var storageContract = new web3.eth.Contract(contractABI, contractAddress);
module.exports = { web3, storageContract };