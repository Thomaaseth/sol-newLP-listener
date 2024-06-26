import { rayFee, solanaConnection } from './constants';
import { storeData } from './utils';
import fs from 'fs';
import chalk from 'chalk';
import path from 'path';
import { Connection } from '@solana/web3.js';

const dataPath = path.join(__dirname, 'data', 'new_solana_tokens.json');

async function monitorNewTokens(connection: Connection) {
  console.log(chalk.green('Monitoring new Solana tokens...'));

  connection.onLogs(rayFee, async (logEvent) => {
    await handleTransaction(logEvent, connection);
  }, 'confirmed');
}

async function handleTransaction({ logs, err, signature }, connection) {
    const startTime = Date.now();  
  if (err) {
    console.error(`Connection error: ${err}`);
    return;
  }

  console.log(chalk.bgGreen(`Found new token signature: ${signature}`));

  try {
    const parsedTransaction = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    });

    if (parsedTransaction && parsedTransaction.meta.err === null) {
      const signer = parsedTransaction.transaction.message.accountKeys[0].pubkey.toString();
      const postTokenBalances = parsedTransaction.meta.postTokenBalances;
      const tokenData = extractTokenData(postTokenBalances);

      
      const newTokenData = {
        lpSignature: signature,
        creator: signer,
        timestamp: new Date().toISOString(),
        baseInfo: tokenData.baseInfo,
        quoteInfo: tokenData.quoteInfo,
        logs,
      };
      
      const storeStart = Date.now();
      await storeData(dataPath, newTokenData);

      const endTime = Date.now();
      console.log(`Transaction processed in ${endTime - startTime} ms`);
    }
  } catch (error) {
    logError(`Error in transaction handling: ${JSON.stringify(error)}`);
  }
}

function extractTokenData(postTokenBalances) {
  let baseInfo = { baseAddress: '', baseDecimals: 0, baseLpAmount: 0 };
  let quoteInfo = { quoteAddress: '', quoteDecimals: 0, quoteLpAmount: 0 };

  for (let balance of postTokenBalances) {
    if (balance.owner === '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1') {
      if (balance.mint !== 'So11111111111111111111111111111111111111112') {
        baseInfo = {
          baseAddress: balance.mint,
          baseDecimals: balance.uiTokenAmount.decimals,
          baseLpAmount: balance.uiTokenAmount.uiAmount,
        };
      } else {
        quoteInfo = {
          quoteAddress: balance.mint,
          quoteDecimals: balance.uiTokenAmount.decimals,
          quoteLpAmount: balance.uiTokenAmount.uiAmount,
        };
      }
    }
  }

  return { baseInfo, quoteInfo };
}

function logError(message) {
  console.log(chalk.red(message));
  fs.appendFile('errorNewLpsLogs.txt', `${message}\n`, err => {
    if (err) console.log('Error writing to error logs', err);
  });
}

monitorNewTokens(solanaConnection);
