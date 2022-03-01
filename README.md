# Blockchain simulator

This project is a command-line blockchain simulator written in plain javascript (there's also a python version of it in ``src-py`` but it's really poor). 

# Documentation
The [documentation](https://github.com/gothic459/bc-js-py/tree/main/src/out/main) has been written using `JSDoc`, it should cover most of the things (it is worth noting that the **entirety** is in polish.
**English** version is still *todo*.
## How it works
 In short:

- we simulate a network of miners eg. `miner 1`, `miner 2` etc. 
- said miners are constricted by having an additional property `power` which is used to simulate **asynchronicity**
```json
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

``` json
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

## Visual representation
There exists a [visual representation](https://github.com/gothic459/blockchain-io-front) of and older release of this simulator(transactions there aren't really anything to brag about).'


