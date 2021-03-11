const {Blockchain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('404b5d8c2bc09d5aade7ca4a63ecb8b074cee9ce8ba88cfc23813c5695b51c6f');
const myWalletAddress = myKey.getPublic('hex');

let futurecoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, 'public key goes here.',10);
tx1.signTransaction(myKey);
futurecoin.addTransaction(tx1);

console.log('\n Starting mining ...');
futurecoin.minePendingBlock(myWalletAddress);
console.log('\n Starting mining again...');
futurecoin.minePendingBlock(myWalletAddress);
let balance = futurecoin.getBalanceOfAddress(myWalletAddress);
console.log('Balance ', balance);