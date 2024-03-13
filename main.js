import {DirectSecp256k1HdWallet} from "@cosmjs/proto-signing"
import { ibcTransfer } from "./components/Ibc.js";
import {SigningStargateClient,coin} from "@cosmjs/stargate"
import { fileURLToPath } from "url";
import { dirname } from "path";
import { resolve } from "path";
import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, ".env");
dotenv.config({ path: envPath });


const tia_base = 10**6

/**
 * Generates a wallet from a mnemonic phrase.
 * @param {string} string - The mnemonic phrase used to generate the wallet.
 * @returns {Promise<DirectSecp256k1HdWallet>} A promise that resolves to an instance of DirectSecp256k1HdWallet.
 */
async function getWalletFromString(string ) {
   return await DirectSecp256k1HdWallet.fromMnemonic(string, {prefix: "celestia"})
}


/**
 * Generates a new mnemonic phrase.
 * @returns {Promise<DirectSecp256k1HdWallet>} A promise that resolves to a new mnemonic phrase.
 */
async function generateMnemonic() {
  const wallet = await DirectSecp256k1HdWallet.generate(12)

  return wallet;
}



const argv = yargs(hideBin(process.argv))
  .scriptName('celestia').
command('transfer', 'Send a transaction to a specified address', (yargs) => {
    return yargs.option('to', {
      alias: 't',
      description: 'The recipient address',
      type: 'string',
      demandOption: true,
    })
    .option('amount', {
      alias: 'a',
      description: 'The amount to send (e.g., 1tia)',
      type: 'number',
      demandOption: true,
    }).option('memo', {
      description: 'Memo msg',
      type: 'string',
      default: false, 
    }).option('full', {
      description: 'Display full transaction data',
      type: 'boolean',
      default: false, 
    });
  }).command('balance', 'Check the wallet balance', () => {})
  .command('address', 'Check the wallet address', () => {})
  .command('ibc-transfer', 'Send an ibc-transaction to a specified address', (yargs) => {
    return yargs.option('to', {
      alias: 't',
      description: 'The recipient address',
      type: 'string',
      demandOption: true,
    })
    .option('amount', {
      alias: 'a',
      description: 'The amount to send (e.g., 1tia)',
      type: 'number',
      demandOption: true,
    }) .option('channelId', {
      alias: 'c',
      description: 'channel_id',
      type: 'string',
      demandOption: true,
    })
    .option('memo', {
      description: 'Memo msg',
      type: 'string',
      default: false, 
    }).option('full', {
      description: 'Display full transaction data',
      type: 'boolean',
      default: false, 
    });
  })
  .command('generate-mnemonic', 'Generate a new wallet mnemonic',() => {}).showHelpOnFail(true)
  .demandCommand(1, '').help().alias('help', 'h').parse();




/**
 * 
 * @param {DirectSecp256k1HdWallet} wallet 
 * @param {string} recipientAddress 
 * @param {number} amount 
 * @param {string} denom 
 * @param {string} rpcEndpoint 
 * @returns {Object}
 */  
async function sendTransaction(wallet, recipientAddress, amount, denom, rpcEndpoint) {
   const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet);
   const [account] = await wallet.getAccounts();
   const tia_amount =coin(amount, denom)
  
   const sendMsg = {
       typeUrl: "/cosmos.bank.v1beta1.MsgSend",
       value: {
           fromAddress: account.address,
           toAddress: recipientAddress,
           amount: [tia_amount],
       },
   };
   
   const memo = argv.memo? argv.memo : "";

   const simulation_gas = await client.simulate(account.address, [sendMsg], memo);
   const used_gas = Math.ceil(simulation_gas /100)
   console.log(`Simulation succeded! with ${simulation_gas} gas.`)
   console.log(`Sending txn! from ${account.address} -> ${recipientAddress} -> ${Number(tia_amount.amount) /tia_base} TIA .`)

   const fee = {
      amount: [coin(used_gas, denom)], 
      gas: "200000", 
  };

   const result = await client.signAndBroadcast(account.address, [sendMsg], fee, memo);
   return result;
}


async function main() {
 const meumonic = process.env.M 
 if(!meumonic){
console.error("wallet config not found! check .env")
  return
 }
  const wallet = await getWalletFromString(meumonic);
  const rpcEndpoint = "https://celestia-rpc.publicnode.com:443"
  const [account] = await wallet.getAccounts()
 
    if (argv._.includes('transfer')) {
       const transactionResult = await sendTransaction(wallet, argv.to, argv.amount, "utia", rpcEndpoint);
       if(argv.full){
          console.log("Transaction Result: ", transactionResult);
       }
       else {
          console.log("Txn: ", `https://www.mintscan.io/celestia/tx/${transactionResult.transactionHash}`);
       }

    }
    else if  (argv._.includes('balance')) {
    const  client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet);
    const balance= await client.getBalance(account.address ,"utia")
    console.log( "%s TIA" ,Number(balance.amount) /tia_base)
    }

    else if  (argv._.includes('address')) {
        console.log( " %s" ,account.address)
   }
    else if  (argv._.includes('generate-mnemonic')) {
      const mnemonic = await generateMnemonic();
      console.log(mnemonic)
     
   }
    else if  (argv._.includes('ibc-transfer')) {

    const transactionResult =  await ibcTransfer(wallet,argv.to,argv.amount,argv.channelId,rpcEndpoint)
      if(argv.full){
        console.log("Transaction Result: ", transactionResult);
     }
     else {
        console.log("Txn: ", `https://www.mintscan.io/celestia/tx/${transactionResult.transactionHash}`);
     }
     
   }

 
}





try {
  main()
} catch (error) {
console.error(error)
}

