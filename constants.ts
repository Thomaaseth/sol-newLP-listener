import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import dotenv from 'dotenv';
dotenv.config();

const RPC_URL = process.env.RPC_URL;
const RPC_WEBSOCKET_ENDPOINT =
  process.env.RPC_WEBSOCKET_ENDPOINT;

export const solanaConnection = new Connection(RPC_URL, {
  wsEndpoint: RPC_WEBSOCKET_ENDPOINT,
});

export const rayFee = new PublicKey(
  '7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5'
);