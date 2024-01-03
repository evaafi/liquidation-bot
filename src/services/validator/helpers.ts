import {beginCell, DictionaryValue, Slice} from "@ton/ton";
import {AssetConfig, AssetData} from "./types";
import crypto from "crypto";

export function createAssetData(): DictionaryValue<AssetData> {
    return {
        serialize: (src: any, buidler: any) => {
            buidler.storeUint(src.s_rate, 64);
            buidler.storeUint(src.b_rate, 64);
            buidler.storeUint(src.totalSupply, 64);
            buidler.storeUint(src.totalBorrow, 64);
            buidler.storeUint(src.lastAccural, 32);
            buidler.storeUint(src.balance, 64);
        },
        parse: (src: Slice) => {
            const sRate = BigInt(src.loadUint(64));
            const bRate = BigInt(src.loadUint(64));
            const totalSupply = BigInt(src.loadUint(64));
            const totalBorrow = BigInt(src.loadUint(64));
            const lastAccural = BigInt(src.loadUint(32));
            const balance = BigInt(src.loadUint(64));
            return { sRate, bRate, totalSupply, totalBorrow, lastAccural, balance };
        }
    }
}

export function createAssetConfig(): DictionaryValue<AssetConfig> {
    return {
        serialize: (src: any, buidler: any) => {
            buidler.storeAddress(src.oracle);
            buidler.storeUint(src.decimals, 8);
            const refBuild = beginCell();
            refBuild.storeUint(src.collateralFactor, 16);
            refBuild.storeUint(src.liquidationThreshold, 16);
            refBuild.storeUint(src.liquidationBonus, 16);
            refBuild.storeUint(src.baseBorrowRate, 64);
            refBuild.storeUint(src.borrowRateSlopeLow, 64);
            refBuild.storeUint(src.borrowRateSlopeHigh, 64);
            refBuild.storeUint(src.supplyRateSlopeLow, 64);
            refBuild.storeUint(src.supplyRateSlopeHigh, 64);
            refBuild.storeUint(src.targeUtilization, 64);
            buidler.storeRef(refBuild.endCell())
        },
        parse: (src: Slice) => {
            const oracle = src.loadAddress();
            const decimals = BigInt(src.loadUint(8));
            const ref = src.loadRef().beginParse();
            const collateralFactor = BigInt(ref.loadUint(16));
            const liquidationThreshold = BigInt(ref.loadUint(16));
            const liquidationBonus = BigInt(ref.loadUint(16));
            const baseBorrowRate = BigInt(ref.loadUint(64));
            const borrowRateSlopeLow = BigInt(ref.loadUint(64));
            const borrowRateSlopeHigh = BigInt(ref.loadUint(64));
            const supplyRateSlopeLow = BigInt(ref.loadUint(64));
            const supplyRateSlopeHigh = BigInt(ref.loadUint(64));
            const targeUtilization = BigInt(ref.loadUint(64));

            return {
                oracle, decimals, collateralFactor, liquidationThreshold,
                liquidationBonus, baseBorrowRate, borrowRateSlopeLow,
                borrowRateSlopeHigh, supplyRateSlopeLow, supplyRateSlopeHigh, targeUtilization
            };
        }
    }
}

export function sha256Hash(input: string): bigint {
    const hash = crypto.createHash('sha256');
    hash.update(input);
    const hashBuffer = hash.digest();
    const hashHex = hashBuffer.toString('hex');
    return BigInt('0x' + hashHex);
}



export const bigIntMin = (...args) => args.reduce((m, e) => e < m ? e : m);
export const bigIntMax = (...args) => args.reduce((m, e) => e > m ? e : m);
