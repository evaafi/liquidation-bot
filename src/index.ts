import { MyDatabase } from "./db/database";
import { TonClient, WalletContractV4 } from "@ton/ton";
import { iotaEndpoint, rpcEndpoint, serviceChatID, tonApiEndpoint } from "./config";
import axios from "axios";
import { Client } from "@iota/sdk";
import { handleTransactions } from "./services/indexer/indexer";
import { validateBalances } from "./services/validator/validator";
import { config } from "dotenv";
import { handleLiquidates } from "./services/liquidator";
import { mnemonicToWalletKey } from "@ton/crypto";
import { Bot } from "grammy";
import * as https from "https";
import { sleep } from "./helpers";
config();

function checkEnvVariables() {
    const requiredEnvVars = [
        'TONAPI_KEY',
        'RPC_API_KEY',
        'TONCENTER_API_KEY',
        'WALLET_PRIVATE_KEY',
        'TELEGRAM_BOT_TOKEN',
        'NODE_TLS_REJECT_UNAUTHORIZED'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missingEnvVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }
}

async function main(bot: Bot) {
    const db = new MyDatabase();
    await db.init();

    const tonApi = axios.create({
        baseURL: tonApiEndpoint,
        httpsAgent: new https.Agent({
            rejectUnauthorized: false,
        }),
        headers: {
            'Authorization': process.env.TONAPI_KEY
        }
    });
    //mainnet
    const tonClient = new TonClient({
        endpoint: rpcEndpoint,
        httpsAgent: new https.Agent({
            rejectUnauthorized: false,
        }),
        apiKey: process.env.RPC_API_KEY
    });
    //testnet
    // const tonClient = new TonClient({
    //     endpoint: rpcEndpoint,
    //     apiKey: process.env.TONCENTER_API_KEY
    // });
    const iotaClient = new Client({
        nodes: [iotaEndpoint],
    });
    const keys = await mnemonicToWalletKey(process.env.TON_WALLET_MNEMONIC.split(' '));
    const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keys.publicKey
    });
    const contract = tonClient.open(wallet);

    handleTransactions(db, tonApi, tonClient)
        .catch(e => {
            console.log(e);
            bot.api.sendMessage(serviceChatID, `[Indexer]: ${JSON.stringify(e)}`);
        })
        .finally(() => console.log("Exiting from handleTransactions..."));

    const validatorID = setInterval(() => {
        validateBalances(db, tonClient, iotaClient)
            .catch(e => {
                console.log(e);
                bot.api.sendMessage(serviceChatID, `[Validator]: ${JSON.stringify(e)}`);
            })
    }, 5000);
    const liquidatorID = setInterval(() => {
        handleLiquidates(db, tonClient, contract, keys, bot)
            .catch(e => {
                console.log(e);
                bot.api.sendMessage(serviceChatID, `[Liquidator]: ${JSON.stringify(e)}`);
            })
    }, 20000);

    setInterval(async () => {
        const blacklistedUsers = await db.handleFailedTasks();
        for (const user of blacklistedUsers) {
            await bot.api.sendMessage(serviceChatID, `❌ User ${user} blacklisted`);
            await sleep(100);
        }
    }, 3000);
}

(() => {
    checkEnvVariables();
    const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
    main(bot)
        .catch(e => {
            console.log(e);
            bot.api.sendMessage(serviceChatID, `Fatal error: ${JSON.stringify(e)}`);
        })
        .finally(() => console.log("Exiting..."));
})()
