import {SigningStargateClient,coin} from "@cosmjs/stargate"

export async function ibcTransfer(wallet, recipientAddress, amount,channelId, rpcEndpoint) {
    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet);
    const [account] = await wallet.getAccounts();
  
   
    const timeoutOffset = 10 * 60 * 1e9; // 10 minutes in nanoseconds
    const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds
    const timeoutTimestamp = (currentTimestamp * 1e9) + timeoutOffset; 
  
    const sendMsg = {
      typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
      value: {
        sourcePort: "transfer",
        sourceChannel: channelId,
        token: { denom: "utia", amount: amount.toString() },
        sender: account.address,
        receiver: recipientAddress,
        timeoutHeight: { revisionNumber: "0", revisionHeight: "0" },
        timeoutTimestamp: timeoutTimestamp,
      },
    };
  
    const memo = "";
  
    const simulation_gas = await client.simulate(account.address, [sendMsg], memo);
    const used_gas = Math.ceil(simulation_gas / 100);
    console.log(`Simulation succeded! with ${simulation_gas} gas.`)
    console.log(`Sending txn! from ${account.address} -> ${recipientAddress} -> ${Number(amount.toString()) /10**6} TIA .`)

    const fee = {
      amount: [coin(used_gas, "utia")],
      gas: "200000",
    };
    
    const result = await client.signAndBroadcast(account.address, [sendMsg], fee, memo);
    
    return result;
  }

