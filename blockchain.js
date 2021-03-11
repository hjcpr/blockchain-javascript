const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction{
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingkey){
        if (signingkey.getPublic('hex') !== this.fromAddress) {
            throw new Error(' You cannot sign transaction for other wallets!');
        }
        const hashTx = this.calculateHash();
        const sign = signingkey.sign(hashTx,'base64');
        this.signature = sign.toDER('hex');
    }

    isValid(){
        if (this.fromAddress === null) return true;

        if (!this.signature || this.signature.length === 0){
            throw new Error('No signature for this transaction!');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block {
    constructor( timestamp,transactions, previousHash ) {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.computeHash();
        this.nonce = 0;
    }

    computeHash(){
        return SHA256(this.timestamp + this.previousHash + JSON.stringify(this.transaction) + this.nonce).toString();
    }
    //Proof of work
    mineBlock(diffilculty){
        while(this.hash.substring(0,diffilculty) != Array(diffilculty + 1 ).join('0')){
            this.nonce++;
            this.hash = this.computeHash();
            //console.log(this.hash);
        }
    }

    hasValidTransaction(){
        for (const tx of this.transactions){
            if (!this.isValid()){
                return false;
            }
        }
        return true;
    }
    
}

class Blockchain{

    constructor(){
        this.blockchain = [this.startGenesisBlock()];
        this.difficulty = 2;
        //mining
        this.pendingTransaction = [];
        this.miningRewards = 100;
    }

    /* Primer bloque o bloque genesis reservado para la creacion de nuevos bloques*/
    startGenesisBlock(){
        return new Block(new Date(),'Genesis Block', '0');
    }

    obtainLastedBlock(){
        return this.blockchain[this.blockchain.length - 1];
    }
    /* Para crear un nuevo bloque:
    *  1.- Obtener el hash del ultimo bloque.
    *  2.- Crear el hash para el bloque nuevo.
    *  3.- Agregar el bloque a la cadena */
    // addNewBlock(newBlock){
    //     newBlock.previousHash = this.obtainLastedBlock().hash
    //     //newBlock.hash = newBlock.computeHash();
    //     newBlock.mineBlock(this.difficulty);
    //     this.blockchain.push(newBlock);
    // }
    minePendingBlock(rewardAddress){
        let block = new Block(new Date(), this.pendingTransaction);
        block.mineBlock(this.difficulty);

        console.log(' Block successful mined! ');
        //console.log(block);
        this.blockchain.push(block);


        this.pendingTransaction = [
            //fromAddress es null porque es el pago por minar... lo envia la propia blockchain.
            new Transaction(null,rewardAddress,this.miningRewards)
        ]
    }

    addTransaction(transaction){
        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Transaction must have from and to address.');
        }

        if (!transaction.isValid()){
            throw new Error('Cannot add invalid transaction to chain.');
        }

        this.pendingTransaction.push(transaction);
    }

    getBalanceOfAddress(address){
        let balance = 0;

        for(const block of this.blockchain) {
            for (const transaction of block.transactions){
                if (transaction.fromAddress === address){
                    balance-= transaction.amount;
                }
                if(transaction.toAddress === address){
                    balance+=transaction.amount;
                }
            }
        }
        return balance;
    }

    isValidChain(){
        for (let i = 1; i<this.blockchain.length; i++) {
            const currentBlock = this.blockchain[ i ];
            const previousBlock = this.blockchain[ i - 1 ];

            if (!currentBlock.hasValidTransaction()){
                return false;
            }

            if ( currentBlock.hash !== currentBlock.computeHash() ){
                return false;
            }

            if ( currentBlock.previousHash !== previousBlock.hash ){
                return false;
            }
            return true;
        }
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;