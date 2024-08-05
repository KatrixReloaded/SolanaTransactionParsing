const solanaweb3 = require('@solana/web3.js');
const dotenv = require('dotenv').config();
const searchAddress = '7LF8NQXQC5fdVXoY7nt7Z2FDd45TMMrQJaiSCWpQQgpM';
const endpoint = process.env.MAINNET_URL;
const solanaConnection = new solanaweb3.Connection(endpoint);
// const solanaConnection = new solanaweb3.Connection(solanaweb3.clusterApiUrl('mainnet-beta'), 'confirmed');

//@param address takes the address of the target contract for which the transactions are being monitored
//@param startSlot stores the oldest slot that you want to retrieve, the lower limit
//@param endSlot stores the most recent slot that you want to retrieve, the upper limit
//@dev getTransactions() is used to generate all data related to the searchAddress's transactions
//@dev Currently, issues with accessing the toAddress && fromAddress correctly
const getTransactionsBySlot = async(address, startSlot, endSlot) => {
    let TxDetails = [];
    const TxDetailsList = [];
    const pubKey = new solanaweb3.PublicKey(address);

    // const startSlotSig = await getFirstTransactionInSlot(address, startSlot);
    // const endSlotSig = await getFirstTransactionInSlot(address, endSlot);
    // console.log("startSlotSig",startSlotSig);
    // console.log("endSlotSig",endSlotSig);

    // let signatures = await solanaConnection.getSignaturesForAddress(pubKey, {before: endSlotSig, until: startSlotSig});
    console.log(TxDetails);
    let signatures = await getSigsInRange(address, startSlot, endSlot);
    console.log();
    console.log(signatures[0]);
    let signatureMapping = signatures.map((transaction) => transaction.signature);
    let transactionDetails = await solanaConnection.getParsedTransactions(signatureMapping, {maxSupportedTransactionVersion: 0, commitment: 'confirmed'});

    signatures.forEach((transaction, i) => {
        const date = new Date(transaction.blockTime * 1000);
        const message = transactionDetails[i].transaction.message;
        const transactionInstructions = message.instructions;
        const fromAddress = message.accountKeys[0].pubkey.toBase58();
        //i temp line to check whether potential to address is being accessed
        let toAddress;
        toAddress = message.accountKeys[1].pubkey.toBase58();

        let logs = transactionDetails[i].meta.logMessages.filter(log => log.includes(searchAddress.toString()));

        TxDetails.push(`Transaction No.: ${i+1}`);
        TxDetails.push(`Signature: ${transaction.signature}`);
        TxDetails.push(`Time: ${date}`);

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

const getSigsInRange = async(address, startSlot, endSlot) => {
    const pubKey = new solanaweb3.PublicKey(address);

    let signatures = [];
    let beforeSignature = null;

    while (true) {
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

        // Filter signatures within the slot range
        const filteredSignatures = fetchedSignatures.filter(sig => sig.slot >= endSlot && sig.slot <= startSlot);
        signatures = signatures.concat(filteredSignatures);

        // Check if the last transaction's slot is before our endSlot
        if (fetchedSignatures[fetchedSignatures.length - 1].slot < endSlot) {
            break;
        }

        // Update the `beforeSignature` to the oldest fetched signature
        beforeSignature = fetchedSignatures[fetchedSignatures.length - 1].signature;

        // If all filtered transactions are within the desired range, break the loop
        if (filteredSignatures.length > 0 && filteredSignatures[filteredSignatures.length - 1].slot <= endSlot) {
            break;
        }
    }

    return signatures;
    // const firstTransactionInSlot = signatures.find(sig => sig.slot === slot);

    // if (!firstTransactionInSlot) {
    //     console.log(`No transactions found in slot ${slot}`);
    //     return;
    // }

    // return await firstTransactionInSlot.signature;
};

getTransactionsBySlot(searchAddress, 281509000, 281509020);