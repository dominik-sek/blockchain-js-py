const {Transaction, Mesh, Miner, Block, Blockchain } = require('./bc.js');
const elliptic = require('elliptic').ec;
const ec = new elliptic('secp256k1');

let blockchain = new Blockchain();
let meshNetwork = new Mesh();
let miners = [];

for(let i = 0; i < 6 ; i++){
    let power = Math.floor(Math.random() * 9) + 1; // 1-10
    miners.push(new Miner(i,`Miner${i}`,power * 50));
}
miners.forEach(miner=>{
    meshNetwork.addToMesh(miner);
})


function generateTransaction(){
    let from = miners[Math.floor(Math.random() * miners.length)]
    let to = miners[Math.floor(Math.random() * miners.length)]
    let amount = Math.floor(Math.random() * 9) + 1

    if(amount > blockchain.checkBalance(from.publicAddress)){
        amount = Math.floor(Math.random() * 9) + 1
    }

    if(from === to){
        to = miners[Math.floor(Math.random() * miners.length)]
    }
    let transaction = new Transaction(from.publicAddress, to.publicAddress, amount)
    transaction.signTransaction(ec.keyFromPrivate(from.privateAddress));
    return transaction;
}

let intervals = []; // tablica z interwałami potrzebna do przechowywania ID interwału w celu poźniejszego wyczyszczenia - przerwania kopania
async function startMining(){
    let iterationNumber = 3; // ilość bloków do wykopania

    // dla każdego górnika ustawiamy interwał który pozwoli na opóźnienie kopania bloku w zależności od jego mocy symulując w pewnym stopniu asynchroniczność

    for(let i = 0; i < miners.length; i++){
        // blockchain.addTransaction(generateTransaction()); 
        intervals[i] = setInterval(()=>blockchain.mineBlock(miners[i].publicAddress,meshNetwork, miners[i], iterationNumber)
                                                                .then(blockchain.addTransaction(generateTransaction()))
                                                                .catch(()=>{stopMining()}),
        (blockchain.difficulty / miners[i].power) * 100000)

    }
}

function stopMining(){
    for(let i = 0; i < miners.length; i++){
        clearInterval(intervals[i]);
    }
    //show blockchain

    //show balances
    console.log(`Balances after: ${blockchain.chain.length} blocks`);
    miners.forEach(miner=>{
        console.log(`${miner.publicAddress} has ${blockchain.checkBalance(miner.publicAddress)}`)
    })
    console.log(`is chain valid: ${blockchain.isChainValid()}`);
    //console.log(blockchain.pendingTransactions)
}
// promise for mining while waiting for the blockchain to be of length 10

startMining();