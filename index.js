const solanaweb3 = require('@solana/web3.js');
const searchAddress = 'H9ZRVEDXbFJfksrR9VcD8U96wL4z7ybSwARNntsPfEzb';
const endpoint = 'https://solana-mainnet.g.alchemy.com/v2/eGBnZGKunXRnGkq6Kkq5cKNqpzzZp8Fl';
const solanaConnection = new solanaweb3.Connection(endpoint);
// const solanaConnection = new solanaweb3.Connection(solanaweb3.clusterApiUrl('mainnet-beta'), 'confirmed');

//@param address takes the public key of the target address for which the transactions are being monitored
//@param numTx stores the number of latest transactions that are checked
//@dev getTransactions() is used to generate all data related to the searchAddress's transactions
//@dev Currently, issues with accessing the toAddress && fromAddress correctly
const getTransactions = async(address, numTx) => {
    const pubKey = new solanaweb3.PublicKey(address);
    let transactionList = await solanaConnection.getSignaturesForAddress(pubKey, {limit: numTx});
    let signatureList = transactionList.map((transaction) => transaction.signature);
    let transactionDetails = await solanaConnection.getParsedTransactions(signatureList, {maxSupportedTransactionVersion: 0});
    transactionList.forEach((transaction, i) => {
            const date = new Date(transaction.blockTime * 1000);
            const message = transactionDetails[i].transaction.message;
            const transactionInstructions = message.instructions;
            const fromAddress = message.accountKeys[0].pubkey.toBase58();
            let toAddress;
            
            //i temp line to check whether potential to address is being accessed
            toAddress = message.accountKeys[1].pubkey.toBase58();
            console.log(`Transaction No.: ${i+1}`);
            console.log(`Signature: ${transaction.signature}`);
            console.log(`From Address: ${fromAddress}`);
            console.log(`To Address: ${toAddress}`);
            console.log(`Time: ${date}`);
            console.log(`Status: ${transaction.confirmationStatus}`);
            transactionInstructions.forEach((instruction, n)=> {
                console.log(`---Program Instructions ${n+1}: ${instruction.program ? instruction.program + ":" : ""} ${instruction.programId.toString()}`);
            });
            console.log("-".repeat(20));
    });
}

getTransactions(searchAddress, 5);