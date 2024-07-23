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
  
To get the transaction details of a particular address, paste the target public key in `searchAddress` variable.  
When `getTransactions(address, int)` is called, the second parameter is to specify the number of transactions that you want to see.  
  
**Side-note:** Will prefer if a common endpoint is provided instead of my personal one. When using the `clusterApiUrl`, it reverts with an error saying `Error: 429 Too Many Requests`  