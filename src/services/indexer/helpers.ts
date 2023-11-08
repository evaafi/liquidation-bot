import {isTestnet} from "../../config";
import {Address} from "@ton/core";

export function getAddressFriendly(addr: Address) {
    return isTestnet ?
        addr.toString({
            bounceable: true,
            testOnly: true
        }) :
        addr.toString({
            bounceable: true,
            testOnly: false
        })
}

export function getRequest(address: Address, before_lt: number) {
    if(before_lt === 0)
        return `v2/blockchain/accounts/${address.toRawString()}/transactions?limit=100`
    else
        return `v2/blockchain/accounts/${address.toRawString()}/transactions?before_lt=${before_lt}&limit=100`
}