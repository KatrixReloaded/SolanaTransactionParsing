# Solana Transaction Parsing  
  
## Terminal Commands  
    
Init:  
```bash
npm init -y
```  
Install solana/web3js:  
```bash
npm i @solana/web3js
```  
To run the code:  
```bash
node index
```  
  
## Code  
  
If using index.js, `getTransactionsBySlot(address, int, int)` sets a range of slots from which transactions are fetched for the contract address provided.  
  
If using tx-time.js, `getTransactionsByTime(address, int, int)` sets a range of slots from a pair of timestamps passed as parameters for the contract address provided.  
  
If using tx-sig.js, `getTransactionsByTxSig(address, address, address)` sets a range of transactions from a pair of tx signatures passed as parameters for the contract address provided.
  
**Side-note:** Will prefer if a common endpoint is provided instead of my personal one. When using the `clusterApiUrl`, it reverts with an error saying `Error: 429 Too Many Requests`  