const solanaweb3 = require('@solana/web3.js');
const searchAddress = 'H9ZRVEDXbFJfksrR9VcD8U96wL4z7ybSwARNntsPfEzb';
const endpoint = 'https://solana-mainnet.g.alchemy.com/v2/eGBnZGKunXRnGkq6Kkq5cKNqpzzZp8Fl';
const solanaConnection = new solanaweb3.Connection(endpoint);
// const solanaConnection = new solanaweb3.Connection(solanaweb3.clusterApiUrl('mainnet-beta'), 'confirmed');

const getTransactions = async(address, numTx) => {
    const pubKey = new solanaweb3.PublicKey(address);
    let transactionList = await solanaConnection.getSignaturesForAddress(pubKey, {limit: numTx});
    let signatureList = transactionList.map((transaction) => transaction.signature);
    let transactionDetails = await solanaConnection.getParsedTransactions(signatureList, {maxSupportedTransactionVersion: 0});
    // console.log(transactionDetails);
    transactionList.forEach((transaction, i) => {
            const date = new Date(transaction.blockTime * 1000);
            const transactionInstructions = transactionDetails[i].transaction.message.instructions;
            console.log(`Transaction No.: ${i+1}`);
            console.log(`Signature: ${transaction.signature}`);
            console.log(`Time: ${date}`);
            console.log(`Status: ${transaction.confirmationStatus}`);
            transactionInstructions.forEach((instruction, n)=> {
                console.log(`---Program Instructions ${n+1}: ${instruction.program ? instruction.program + ":" : ""} ${instruction.programId.toString()}`);
            });
            console.log("-".repeat(20));
    });
}

getTransactions(searchAddress, 5);