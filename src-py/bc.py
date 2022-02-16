import datetime
from hashlib import sha256
import json
class Transaction:
    def __init__(self, sender, recipient, amount):
        self.sender = sender
        self.recipient = recipient
        self.amount = amount
        self.timestamp = datetime.datetime.now()


    def print_transaction(self):
        print("From:", self.sender)
        print("To:", self.recipient)
        print("Amount:", self.amount)

    def generate_hash(self):
        transaction_contents = str(self.sender) + str(self.recipient) + str(self.amount)
        transaction_hash = sha256(transaction_contents.encode())
        return transaction_hash.hexdigest()



class Block:
    def __init__(self,minerAddress, timestamp, transactions, previous_hash):
        self.minerAddress = minerAddress
        self.timestamp = timestamp
        self.transactions = transactions
        self.previous_hash = previous_hash
        self.nonce = 0
        self.hash = self.hash_block()

    def hash_block(self):
        return sha256(str(str(self.timestamp) + str(self.transactions) + str(self.previous_hash) +str(self.nonce)).encode()).hexdigest()

    

    #proof of work algorithm
    def mine_block(self, difficulty):
        while self.hash[:difficulty] != "0"*difficulty:
            self.nonce += 1
            self.hash = self.hash_block()

        print("Block mined:", self.hash)



    def print_block(self):
        print("==========================================================")
        print("timestamp:", self.timestamp)
        block = {
            "minerAddress": self.minerAddress,
            "previous_hash": self.previous_hash,
            "nonce": self.nonce,
            "hash": self.hash,
            "transactions": []
        }
        
        for transaction in self.transactions:
            block["transactions"].append({

                "sender": transaction.sender,
                "recipient": transaction.recipient,
                "amount": transaction.amount
            })

        print(json.dumps(block, indent=4))

        ##printing all transactions



class Blockchain:
    def __init__(self):
        self.chain = []
        self.transactions = []
        self.difficulty = 3
        self.create_genesis_block()

    def create_genesis_block(self):
        self.chain.append(Block("SYSTEM",datetime.datetime.now(), [], "0"))

    def get_last_block(self):
        return self.chain[-1]
    
    def add_block(self, block):
        self.chain.append(block)
    
    def add_transaction(self, transaction):
        self.transactions.append(transaction)
    
    def mine_block(self, minerAddress):
        last_block = self.get_last_block()
        new_block = Block(minerAddress,datetime.datetime.now(), self.transactions, last_block.hash)
        new_block.mine_block(self.difficulty)
        self.chain.append(new_block)
        self.transactions = []


        return new_block
    
    def print_blockchain(self):
        for block in self.chain:
            block.print_block()
    
    def is_chain_valid(self):
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i-1]
            if current_block.hash != current_block.hash_block():
                return False
            if current_block.previous_hash != previous_block.hash_block():
                return False
        return True

    def get_balance(self, address):
        balance = 0
        for block in self.chain:
            for transaction in block.transactions:
                if transaction.sender == address:
                    balance -= transaction.amount
                if transaction.recipient == address:
                    balance += transaction.amount
        return balance

    def get_transactions(self, address):
        transactions = []
        for block in self.chain:
            for transaction in block.transactions:
                if transaction.sender == address or transaction.recipient == address:
                    transactions.append(transaction)
        return transactions

class Miner:
    def __init__(self, id, name, power, header, private_key, public_key):
        self.id = id
        self.name = name
        self.power = power
        self.header = header
        self.private_key = private_key
        self.public_key = public_key


def main():
    import random
    miners = list()

    for i in range(0, 10):
        miners.append(Miner(i, "Miner"+str(i), 100, "Header", "Private Key", "Public Key"))

    blockchain = Blockchain()
    
    

    
    for miner in miners:
        from_miner = random.randint(0,len(miners))
        to_miner = random.randint(0,len(miners))
        if(from_miner == to_miner):
            to_miner = random.randint(0,len(miners))
        amount = random.randint(1,100)
        blockchain.add_transaction(Transaction(from_miner, to_miner,amount))
        blockchain.mine_block(miner.id)


    
    blockchain.print_blockchain()


if __name__ == "__main__":
    main()