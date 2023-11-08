import {MyDatabase} from "../../db/database";
import {AxiosInstance, isAxiosError} from "axios";
import {AssetID, evaaMaster} from "../../config";
import {getAddressFriendly, getRequest} from "./helpers";
import {sleep} from "../../helpers";
import {Address} from "@ton/core";
import {GetResult, UserPrincipals} from "./types";
import {Cell, Dictionary, TonClient} from "@ton/ton";

export async function handleTransactions(db: MyDatabase, tonApi: AxiosInstance, tonClient: TonClient) {
    let before_lt = 0;
    while (true) {
        const result = await tonApi.get(getRequest(evaaMaster, before_lt));
        before_lt = 0;
        const transactions = result.data.transactions;
        if (transactions.length === 0) break;
        const first = await db.isTxExists(transactions[0].hash);
        if (first) {
            await sleep(1000);
            continue;
        }
        transactions.sort((a: any, b: any) => {
            return b.lt - a.lt;
        })
        for (const transaction of transactions) {
            const hash = transaction.hash;
            const utime = transaction.utime * 1000;
            const result = await db.isTxExists(hash);
            if (result) continue;
            await db.addTransaction(hash, utime);
            console.log(`Transaction ${hash} added`);
            before_lt = transaction.lt;

            let op = transaction['in_msg']['op_code'] ? transaction['in_msg']['op_code'] : undefined;
            if (op === undefined) continue;
            op = parseInt(op);
            let userContractAddress: Address;
            if (op === 0x1 || op === 0x2 || op === 0x3 || op === 0x7362d09c || op === 0xd2) {
                if (!(transaction.compute_phase.success === true)) continue;
                const outMsgs = transaction.out_msgs;
                if (outMsgs.length !== 1) continue;
                userContractAddress = Address.parseRaw(outMsgs[0].destination.address);
            }
            else if (op === 0x11a || op === 0x211 || op === 0x311) {
                if (!(transaction.compute_phase.success === true)) continue;
                userContractAddress = Address.parseRaw(transaction.in_msg.source.address);
                if(op === 0x311) {
                    const report = transaction.out_msgs[0];
                    if(report === undefined) {
                        throw new Error(`Report is undefined for transaction ${hash}`);
                    }
                    const bodySlice = Cell.fromBoc(Buffer.from(report['raw_body'], 'hex'))[0].beginParse();
                    bodySlice.loadCoins() // contract version
                    bodySlice.loadMaybeRef() // upgrade info
                    bodySlice.loadInt(2) // upgrade exec
                    const reportOp = bodySlice.loadUint(32);
                    if(reportOp != 0x311a) {
                        console.log(reportOp.toString(16));
                        throw new Error(`Report op is not 0x331a for transaction ${hash}`);
                    }
                    const queryID = bodySlice.loadUintBig(64);
                    await db.liquidateSuccess(queryID);
                    console.log(`Liquidation task (Query ID: ${queryID}) successfully completed`);
                }
            }
            else {
                continue;
            }
            let userDataResult: GetResult;
            while (true) {
                try {
                    userDataResult = await tonClient.runMethodWithError(
                        userContractAddress, 'getAllUserScData'
                    );
                    break;
                } catch (e) {
                    if (!isAxiosError(e)) {
                        console.log(isAxiosError(e));
                        console.log(e)
                    }
                }
            }
            if (userDataResult.exit_code !== 0)
                continue;
            const codeVersion = userDataResult.stack.readNumber();
            userDataResult.stack.readCell(); // master
            const userAddress = userDataResult.stack.readCell().beginParse().loadAddress();
            const principalsDict = userDataResult.stack.readCellOpt()?.beginParse()
                .loadDictDirect(Dictionary.Keys.BigUint(256), Dictionary.Values.BigInt(64))
            const user = await db.getUser(getAddressFriendly(userContractAddress));
            const userPrincipals: UserPrincipals = {
                ton: 0n,
                usdt: 0n,
                usdc: 0n
            };
            if (principalsDict !== undefined) {
                if (principalsDict.has(AssetID.ton))
                    userPrincipals.ton = principalsDict.get(AssetID.ton);
                if (principalsDict.has(AssetID.usdt))
                    userPrincipals.usdt = principalsDict.get(AssetID.usdt);
                if (principalsDict.has(AssetID.usdc))
                    userPrincipals.usdc = principalsDict.get(AssetID.usdc);
            }
            if (user) {
                if (user.createdAt > utime)
                    user.createdAt = utime;
                if (user.updatedAt < utime)
                    user.updatedAt = utime;
                if (user.codeVersion != codeVersion)
                    user.codeVersion = codeVersion;
                await db.updateUser(getAddressFriendly(userContractAddress), user.codeVersion,
                    user.createdAt, user.updatedAt, userPrincipals.ton,
                    userPrincipals.usdt, userPrincipals.usdc);
                console.log(`Contract ${getAddressFriendly(userContractAddress)} updated`);
            }
            else {
                await db.addUser(getAddressFriendly(userAddress), getAddressFriendly(userContractAddress), codeVersion,
                    utime, utime, userPrincipals.ton, userPrincipals.usdt, userPrincipals.usdc);
                console.log(`Contract ${getAddressFriendly(userContractAddress)} added`);
            }
        }

        console.log(`Before lt: ${before_lt}`);
        await sleep(1000);
    }
}
