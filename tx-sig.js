const solanaweb3 = require('@solana/web3.js');
const dotenv = require('dotenv').config();
const searchAddress = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8';
const endpoint = process.env.MAINNET_URL;
const solanaConnection = new solanaweb3.Connection(endpoint);
// const solanaConnection = new solanaweb3.Connection(solanaweb3.clusterApiUrl('mainnet-beta'), 'confirmed');

//@param address takes the address of the target contract for which the transactions are being monitored
//@param startSlot stores the oldest slot that you want to retrieve, the lower limit
//@param endSlot stores the most recent slot that you want to retrieve, the upper limit
//@dev getTransactions() is used to generate all data related to the searchAddress's transactions
//@dev Currently, issues with accessing the toAddress && fromAddress correctly
const getTransactionsByTxSig = async(address, startTx, endTx) => {
    let TxDetails = [];
    const TxDetailsList = [];
    const pubKey = new solanaweb3.PublicKey(address);

    let signatures = await solanaConnection.getSignaturesForAddress(pubKey, {before: endTx, until: startTx, limit: 1000});

    let signatureMapping = signatures.map((transaction) => transaction.signature);
    let transactionDetails = await solanaConnection.getParsedTransactions(signatureMapping, {maxSupportedTransactionVersion: 0, commitment: 'confirmed'});

    signatures.forEach((transaction, i) => {
        const date = new Date(transaction.blockTime * 1000);
        const message = transactionDetails[i].transaction.message;
        const transactionInstructions = message.instructions;

        let logs = transactionDetails[i].meta.logMessages.filter(log => log.includes(searchAddress.toString()));

        TxDetails.push(`Transaction No.: ${i+1}`);
        TxDetails.push(`Signature: ${transaction.signature}`);
        TxDetails.push(`Time: ${date}`);

        console.log(`Transaction No.: ${i+1}`);
        console.log(`Signature: ${transaction.signature}`);
        console.log(`Time: ${date}`);
        console.log(`Status: ${transaction.confirmationStatus}`);
        console.log();

        console.log("Instructions: ");
        transactionInstructions.forEach((instruction, n)=> {
            const parsedInstruction = instruction.parsed;
            if (parsedInstruction && parsedInstruction.type === 'transfer') {
                const fromAddress = parsedInstruction.info.source;
                const toAddress = parsedInstruction.info.destination;
                const amount = parsedInstruction.info.amount;

                console.log(`Token Transfer: ${amount} tokens from ${fromAddress} to ${toAddress}`);
            } 
            else if (parsedInstruction && parsedInstruction.type === 'transferChecked') {
                const fromAddress = parsedInstruction.info.source;
                const toAddress = parsedInstruction.info.destination;
                const amount = parsedInstruction.info.tokenAmount.uiAmount;

                console.log(`Token TransferChecked: ${amount} tokens from ${fromAddress} to ${toAddress}`);
            }
        });
        console.log();

        console.log(`Logs:`);
        logs.forEach((log, i) => {
            console.log(`Log ${i}: ${log}`);
            TxDetails.push(`Log ${i}: ${log}`);
        });

        console.log("-".repeat(20));
        console.log();
        console.log();

        TxDetailsList.push(TxDetails);
        TxDetails = [];
    });

    return TxDetailsList;
};

getTransactionsByTxSig(searchAddress, '5FSjGxzETGXFAdq6s6NDcoELmbSMJAahLPpSsaSCjDzPGx6RqnseHoTn36doNQVfBwgYuAoqNsLSVqojkKJiCRtj', 'M7nU6eXguHvywN5ZCczFjoL9hTXXf7isqpcy1kzMGDKtFU3MyD4MHv9moaAfMxyTvW2yoEG2wJtJzXEZyR4kK7y');