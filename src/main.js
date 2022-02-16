const {Transaction, Mesh, Miner, Block, Blockchain } = require('./bc.js');
const elliptic = require('elliptic').ec;
const ec = new elliptic('secp256k1');


/**
 * Tworzymy obiekty blockchain, meshNetwork, miners i intervals
 * 
 * @param {Blockchain} obiekt blockchain
 * @param {Mesh} -
 * @param {Array} tablica górników
 * @param {Array} tablica z interwałami potrzebna do przechowywania ID interwału w celu poźniejszego wyczyszczenia - przerwania kopania
 */
let blockchain = new Blockchain();
let meshNetwork = new Mesh();
let miners = [];
let intervals = [];

/**
 * Funkcja tworząca górników
 * @static
 * @function createMiners
 * @example createMiners(3)
 * @param {int} numberOfMiners ilość górników do utworzenia
 */
function createMiners(numberOfMiners){

    for(let i = 0; i < numberOfMiners ; i++){
        let power = Math.floor(Math.random() * 9) + 1; // 1-10
        miners.push(new Miner(i,`Miner${i}`,power * 50));
    }
    
    miners.forEach(miner=>{
        meshNetwork.addToMesh(miner);
    })

    console.log(`Miners added to network`);
    console.log(miners);
}

/**
 * Funkcja generująca transakcje
 * @static
 * @function generateTransaction
 * @returns {Transaction} transkacja do dodania do bloku
 */
function generateTransaction(){
    /**
     * Generujemy nadawce, odbiorce oraz ilość waluty do przesłania
     */
    let from = miners[Math.floor(Math.random() * miners.length)]
    let to = miners[Math.floor(Math.random() * miners.length)]
    let amount = Math.floor(Math.random() * 9) + 1

    /**
     * Sprawdzamy czy nadawca i odbiorca są różni aby uniknąć sytuacji w której górnik wysyła walute sam do siebie
     * */
     if(from === to){
        to = miners[Math.floor(Math.random() * miners.length)] 
    }

    /**
     * sprawdzamy czy górnik posiada wystarczającą ilość pieniędzy na wykonanie transakcji
     * tak naprawdę nie jest to potrzebne ponieważ w {@link Transaction} istnieją już odpowiednie metody
     * */
    if(amount > blockchain.checkBalance(from.publicAddress)){
        amount = Math.floor(Math.random() * 9) + 1
    }

   /**
    * Generujemy transakcję oraz używamy metody keyFromPrivate w celu wygenerowania klucza co pozwoli na podpisanie transkacji
    */
    let transaction = new Transaction(from.publicAddress, to.publicAddress, amount)
    transaction.signTransaction(ec.keyFromPrivate(from.privateAddress));
    return transaction;
}

/**
 * Funkcja tworząca interwały górników
 * 
 * @function startMining
 * @static
 * @example startMining(3) 
 * @param {int} iterationNumber liczba iteracji do wykonania = ilość bloków w blockchainie po których symulacja zostanie zatrzymana
 */
async function startMining(iterationNumber){
     // ilość bloków do wykopania

    // dla każdego górnika ustawiamy interwał który pozwoli na opóźnienie kopania bloku w zależności od jego mocy symulując w pewnym stopniu asynchroniczność


    for(let i = 0; i < miners.length; i++){

        /**
         * Ustalamy interwał(opóźnienie wykonania metody mineBlock) w zależności od mocy górnika oraz trudności blockchainu
         * 
         * 
         */
        intervals[i] = setInterval(()=>blockchain.mineBlock(miners[i].publicAddress,meshNetwork, miners[i], iterationNumber)
                                                                .then(blockchain.addTransaction(generateTransaction()))
                                                                .catch(()=>{stopMining()}),
        (blockchain.difficulty / miners[i].power) * 100000)

    }
}

/**
 * Funkcja zatrzymująca symulację oraz wypisująca w konosli informacje o blockchainie oraz górnikach
 * @static
 * @function stopMining
 * @example stopMining()
 * @returns {void}
 */
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
    
    // blockchain.popAnyBlock(2)
    // blockchain.showBlockchain();
    // console.log(`is chain valid after tampering: ${blockchain.isChainValid()}`);

}

createMiners(5);
startMining(10);


