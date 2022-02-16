const SHA256 = require("crypto-js/sha256");
// const _ = require('lodash');
const elliptic = require('elliptic').ec; // elliptic curve
const ec = new elliptic('secp256k1');

// const key = ec.genKeyPair();
// const publicKey = key.getPublic('hex');

//tworzymy  zmienną daty w celu update'u daty co iteracje
let date = new Date(Date.now());

//tworzymy klase transaction która będzie przechowywać dane transakcji oraz czas wykonania transakcji który zostanie wykorzystany do wygenerowania hasha transakcji
class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.timestamp = date;
    }

    //metoda hashująca transakcję
    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount + this.timestamp).toString();
    };
    
    //metoda podpisująca transakcję
    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.fromAddress){
            console.log('Cannot sign transaction with another address');
            return;
        }
        const transactionHash = this.calculateHash();
        const signature = signingKey.sign(transactionHash, 'base64');
        this.signature = signature.toDER('hex');
    }

    isTransactionValid(){
        if(this.fromAddress === "SYSTEM") return true;
        if(!this.signature || this.signature.length === 0){
            console.log('No signature in this transaction');
            return;
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }

}

class Mesh {

    constructor(id) {
        this.id = id;
        this.peerList = [];
    }

    addToMesh(miner) {
        this.peerList.push(miner);
    }

    showMesh() {
        console.log("Peer List: ");
        for (var i = 0; i < this.peerList.length; i++) {
            console.log(this.peerList[i].id);
        }
    }

    checkIfExsits(miner) {
        for (var i = 0; i < this.peerList.length; i++) {
            if (this.peerList[i].id === miner.id) {
                return true;
            }
        }
        return false;
    }

    removePeer(miner) {
        for (var i = 0; i < this.peerList.length; i++) {
            if (this.peerList[i].id === miner.id) {
                this.peerList.splice(i, 1);
                console.log("Miner " + miner.id + " has been removed from the mesh network");
            }
        }
    }

    getIndexForMiner(){
        if(this.peerList.length === 0) return -1;
        return this.peerList.length;
    }

}

class Miner {
    constructor(id, name, power, address) {
        this.id = id;
        this.name = name;
        this.power = power;
        this.currHeader = null;
        this.privateAddress = ec.genKeyPair().getPrivate('hex'); //prywatny
        this.publicAddress = ec.keyFromPrivate(this.privateAddress).getPublic('hex'); 
    }
}

class Block {
    constructor(minerAddress, timestamp, transactions, previousHash = '') {

        this.minerAddress = minerAddress;
        this.timestamp = timestamp;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
        this.transactions = transactions;
    }

    calculateHash() {
        return SHA256(this.index + this.previousHash + this.timestamp
            + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    proofOfWork(difficulty) {

        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
    }

    areTransactionsValid(){
        for(const transaction of this.transactions){
            if(!transaction.isTransactionValid()) return false;
        }
        return true;
    }
}


class Blockchain {

    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 3;
        this.miningReward = 15; // 15 reward seems balanced
        this.pendingTransactions = [];
    }
    //constructor(minerAddress, timestamp, transactions, previousHash = '')

    createGenesisBlock() {
        return new Block("SYSTEM", this.getDate(), [] , "0");
    }

    getDate() {
        if (date !== new Date(Date.now())) date = new Date(Date.now()); 
        return date.getDate()
            + "/" + date.getMonth() + 1
            + "/" + date.getFullYear()
            + " " + date.getHours()
            + ":" + date.getMinutes()
            + ":" + date.getSeconds();
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    broadcastBlock(broadcaster, block, meshNetwork) {
        for (var i = 0; i < meshNetwork.peerList.length; i++) {
            meshNetwork.peerList[i].currHeader = block.hash;
        }
    }

    
    addTransaction(transaction){

        if(!transaction.fromAddress || !transaction.toAddress || !transaction.isTransactionValid()){
            console.log('invalid transaction') 
            return
        }
        // if(!transaction.isTransactionValid()) throw new Error('Invalid transaction');
        if(transaction.amount <= 0){
            console.log('invalid amount')
            return;
        }
        if(this.checkBalance(transaction.fromAddress) < transaction.amount) {
            console.log("Insufficient balance");
            console.log(`Trying to send ${transaction.amount} with ${this.checkBalance(transaction.fromAddress)} in wallet`);
            return;
        }

        this.pendingTransactions.push(transaction);
    }
    
    checkBalance(address){
        //find the balance of the address by looking through the wallets
        let balance = 5; // startowe fundusze
        for(const block of this.chain){
            for(const transaction of block.transactions){

                if(transaction.fromAddress === address) balance -= transaction.amount;
                if(transaction.toAddress === address) balance += transaction.amount;
            }
        }
        return balance;
    }

    mineBlock(address, meshNetwork, miner, howManyIterations) {
        console.log(`Miner ${miner.id} with power ${miner.power} is mining block ${this.chain.length}`);
        return new Promise((resolve, reject) => {
            if (this.chain.length === howManyIterations) {

                console.log("Blockchain: ");
                for (var i = 0; i < this.chain.length; i++) {
                    console.log(this.chain[i]);
                }

                reject();
            }
            const reward = new Transaction("SYSTEM", address, this.miningReward);
            this.pendingTransactions.push(reward);

            const costs = new Transaction(address, "Tauron Energia", (miner.power / this.miningReward) * 0.01 );
            costs.signTransaction(ec.keyFromPrivate(miner.privateAddress));
            this.pendingTransactions.push(costs);

            const block = new Block(address, this.getDate(), this.pendingTransactions, this.getLastBlock().hash);
            
            block.proofOfWork(this.difficulty);
            this.chain.push(block);
            
            this.broadcastBlock(miner, block, meshNetwork)
            this.pendingTransactions = [];
            resolve(block);
        });


    }


    isChainValid() {

        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
            if (currentBlock.hash !== currentBlock.calculateHash()) return false;
            if (currentBlock.previousHash !== previousBlock.hash) return false;
            if(!currentBlock.areTransactionsValid()) return false;
        }
        return true;
    }

}


module.exports = {

    Transaction,
    Mesh,
    Miner,
    Block,
    Blockchain,
    
}
