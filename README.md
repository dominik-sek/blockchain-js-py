# Blockchain simulator

This project is a command-line blockchain simulator written in plain javascript (there's also a python version of it in ``src-py`` but it's really poor). 

# Documentation
The [documentation](https://github.com/gothic459/bc-js-py/tree/main/src/out/main) has been written using `JSDoc`, it should cover most of the things (it is worth noting that the **entirety** is in polish.
**English** version is still *todo*.
## How it works
 In short:

- we simulate a network of miners eg. `miner 1`, `miner 2` etc. 
- said miners are constricted by having an additional property `power` which is used to simulate **asynchronicity**
```javascript
[
  Miner { 
    id: 0,
    name: 'Miner0',
    power: 250,
    currHeader: null,
    privateAddress: 'e84b20d45ea0d3004dacc1f85b097bef360567d5df5fd806c2602aff410d3943',
    publicAddress: '043a51661f0f2edd6090fb2db851dc1c3f3f5153c8985116a117a120648ecde9bfe7f87ab0b1ddca4718a0246da32776e5eb122df941aa8c5f0edc97bace4231d9'
  },
  Miner {
    id: 1,
    name: 'Miner1',
    power: 100,
    currHeader: null,
    privateAddress: 'a87a314906008828df746e0501915565606e6698b8e474ebe2cabf6868a4beb2',
    publicAddress: '04769432a4925ddb01e936c01cc3ccfc94902bb818ebea6687b28bcc80ec9cac994b12fc6cb8cc941ae3a3db39710df1b30c1467b83cec0a009b51b59bdbf84309'
  }
]
```
- miners have their own `public` and `private` addresses
- we create a new `blockchain` which is initiated with a `genesis block`:
- we can also set a fixed amount of blocks to mine

```javascript
Block {
  minerAddress: 'SYSTEM',
  timestamp: '1/21/2022 18:38:50',
  previousHash: '0',
  nonce: 0,
  hash: '216232d9c6689a616b0d991b9dba6748061876fbaa7b2e938056453f1b0d0f1d',
  transactions: []
}
```
- after blockchain creation it is time to mine away:
    - to make the mining more difficult we use the `` proof of work `` algorithm
    - each miner has an interval after which he can attempt to mine a block that is calculated with this formula:
        ```javascript
        blockchain.difficulty / miners[i].power) * 100000
        ```
    - each miner has their wallet bound to their public address
    - in order to simulate a lively blockchain we generate some random  transactions that are ``signed`` by miners
    - said transactions are then put into transaction queue which is then added to the blockchain after a miner has successfully mined a block
    - in order to prevent miners from getting rich, every mining attempt costs some amount of coins
        ```javascript
        (miner.power / this.miningReward) * 0.01
        ```
    - after a successfull mining attempt, the miner is awarded with coins and the award is then put into the transaction queue
    
- after reaching the fixed amount of blocks to mine, we see the result(the whole blockchain with transactions in each block) as well as balances of all miners.
    ```javascript
        Block {
    minerAddress: '04988608561260b754f374012198af216410333bb28a24d37aa2faaea21b440e390bb48c3ad024d1b77ef0bc2717d70a4f260236adcae41787d12f1ddcdb6345f2',
    timestamp: '1/21/2022 18:51:20',
    previousHash: '0006d8340d69550e1672d2ad75d8a81a2ef14a0dc8942772583c409b73272ff7',
    nonce: 2752,
    hash: '000fe7f11c97d60e69bb5406c3e0f4c17f05fa18b1f73052d42080b0cf313130',
    transactions: [

        Transaction {
        fromAddress: '04787f768be273fb7f144fad3b80d1704575fcc2ecca1fcd64775c3294ec84ccd12b000519c18ce36fde25cca7cf050939248f5ad8fb64e0952201fbc720fd7691',
        toAddress: '04a45bc2abd4a0917a6af30048d8892d1f6c2a4b88f42505d84be109eca8675fac794da780739abec2ada8692d6fbea3d3b225ed3f4041f5b2d7a04dc6ebed15b2',
        amount: 1,
        timestamp: 2022-03-01T17:51:19.764Z,
        signature: '3044022023b989922edeb93555e9b71b910d2778ba5602bca0972719045f8998b25b764802205c5ae8fcec47c2b982b1c9a42fece294438eed457250b64b28a28b9ee3187fbf'
        },

        Transaction {
        fromAddress: 'SYSTEM',
        toAddress: '04988608561260b754f374012198af216410333bb28a24d37aa2faaea21b440e390bb48c3ad024d1b77ef0bc2717d70a4f260236adcae41787d12f1ddcdb6345f2',
        amount: 15,
        timestamp: 2022-03-01T17:51:19.764Z
        }
    }
    ```

## Visual representation
There exists a [visual representation](https://github.com/gothic459/blockchain-io-front) of and older release of this simulator(transactions there aren't really done well).


