const solanaweb3 = require('@solana/web3.js');
const searchAddress = 'EXiThgdnnkqpj77sY3gZUzj2xAQPZv49v7jEYNeaDgs2';
// const endpoint = <MAINNET-ENDPOINT>;
// const solanaConnection = new solanaweb3.Connection(endpoint);
const solanaConnection = new solanaweb3.Connection(solanaweb3.clusterApiUrl('mainnet-beta'), 'confirmed');

async function getSlotFromTimestamp(connection, timestamp) {
    const currentSlot = await connection.getSlot();
    const currentBlockTime = await connection.getBlockTime(currentSlot);

    if (!currentBlockTime) {
        throw new Error('Failed to fetch current block time.');
    }
    const timeDifference = currentBlockTime - timestamp;
    const slotDifference = Math.floor(timeDifference / 0.4); // 0.4 seconds per slot
    const estimatedSlot = currentSlot - slotDifference;
    return estimatedSlot;
}


//@param address takes the address of the target contract for which the transactions are being monitored
//@param startTxTime takes the oldest timestamp of slots you want
//@param endTxTime takes the most recent timestamp
//@dev getTransactions() is used to generate all data related to the searchAddress's transactions
//@dev Currently, issues with accessing the toAddress && fromAddress correctly
const getTransactionsByTime = async(address, startTxTime, endTxTime) => {
    const TxDetails = [];
    const TxDetailsList = [];
    const pubKey = new solanaweb3.PublicKey(address);

    const startSlot = await getSlotFromTimestamp(solanaConnection, startTxTime);
    const endSlot = await getSlotFromTimestamp(solanaConnection, endTxTime);

    let signatures = await getSigsInRange(address, endSlot, startSlot);
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
}

const getSigsInRange = async(address, startSlot, endSlot) => {
    const pubKey = new solanaweb3.PublicKey(address);

    let signatures = [];
    let beforeSignature = null;

    while (true) {
        if(signatures.length == 1000) {
            break;
        }
        const options = {
            limit: 1000,
            before: beforeSignature
        };
        console.log(beforeSignature);
        const fetchedSignatures = await solanaConnection.getSignaturesForAddress(
            pubKey,
            options
        );

        if (fetchedSignatures.length === 0) {
            break;
        }

        const filteredSignatures = fetchedSignatures.filter(sig => sig.slot >= endSlot && sig.slot <= startSlot);
        signatures = signatures.concat(filteredSignatures);
        if(signatures.length > 1000) {
            while(true) {
                signatures.pop(signatures.length - 1);
                if(signatures.length == 1000) {
                    break;
                }
            }
            break;
        }

        beforeSignature = fetchedSignatures[fetchedSignatures.length - 1].signature;
        
        if (fetchedSignatures[fetchedSignatures.length - 1].slot <= endSlot) {
            break;
        }
    }

    return signatures;
};

getTransactions(searchAddress, 5);
