const solanaweb3 = require('@solana/web3.js');
const searchAddress = 'EXiThgdnnkqpj77sY3gZUzj2xAQPZv49v7jEYNeaDgs2';
const endpoint = 'https://solana-mainnet.g.alchemy.com/v2/eGBnZGKunXRnGkq6Kkq5cKNqpzzZp8Fl';
const solanaConnection = new solanaweb3.Connection(endpoint);
// const solanaConnection = new solanaweb3.Connection(solanaweb3.clusterApiUrl('mainnet-beta'), 'confirmed');

//@param address takes the address of the target contract for which the transactions are being monitored
//@param endTx stores the transaction hash as a reference point for finding transactions before it
//@param numTx stores the number of latest transactions that are checked
//@dev getTransactions() is used to generate all data related to the searchAddress's transactions
//@dev Currently, issues with accessing the toAddress && fromAddress correctly
const getTransactions = async(address, startSlot, endSlot, numTx) => {
    const pubKey = new solanaweb3.PublicKey(address);
    let transactionList = await solanaConnection.getSignaturesForAddress(pubKey, {before: endSlot, until: startSlot, limit: numTx});
    let signatureList = transactionList.map((transaction) => transaction.signature);
    let transactionDetails = await solanaConnection.getParsedTransactions(signatureList, {maxSupportedTransactionVersion: 0, commitment: 'confirmed'});

    transactionList.forEach((transaction, i) => {
        const date = new Date(transaction.blockTime * 1000);
        const message = transactionDetails[i].transaction.message;
        const transactionInstructions = message.instructions;
        const fromAddress = message.accountKeys[0].pubkey.toBase58();
        //i temp line to check whether potential to address is being accessed
        let toAddress;
        toAddress = message.accountKeys[1].pubkey.toBase58();
        let logs = transactionDetails[i].meta.logMessages;
        console.log(`Transaction No.: ${i+1}`);
        console.log(`Signature: ${transaction.signature}`);
        console.log(`From Address: ${fromAddress}`);
        console.log(`To Address: ${toAddress}`);
        console.log(`Time: ${date}`);
        console.log(`Status: ${transaction.confirmationStatus}`);
        console.log();
        console.log("Instructions: ");
        transactionInstructions.forEach((instruction, n)=> {
            console.log(`---Program Instructions ${n+1}: ${instruction.program ? instruction.program + ":" : ""} ${instruction.programId.toString()}`);
        });
        console.log();
        console.log(`Logs:`);
        logs.forEach((log, i) => console.log(`Log ${i}: ${log}`));
        console.log("-".repeat(20));
        console.log();
        console.log();
    });
}

getTransactions(searchAddress, 5);