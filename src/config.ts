import { Address } from "@ton/core";

// ------------------ Testnet Config ------------------
// export const evaaMaster = Address.parse('kQAzAwpmJcfIYYHWtsgOgZS7dEX2wSKc1AZvX8LOqGIql73J');
// export const AssetID = {
//     ton: 11876925370864614464799087627157805050745321306404563164673853337929163193738n,
//     usdt: 86694366741094749062287783818727367954742022542304928884005697964602772528420n,
//     usdc: 105774761695555151365808087757508311108737773050090164214212917183512217679353n,
//     btc: 108059115704294286208476446336309686672059004857316698839953932256936062694679n,
//     eth: 31335842567561280573532271726358948569863606190033045590913827342873825864293n
// };
// export const rpcEndpoint = 'https://testnet.toncenter.com/api/v2/jsonRPC'
// export const tonApiEndpoint = 'https://testnet.tonapi.io/';
// export const isTestnet = true;
//
// export const decimals = {
//     ton: 1_000_000_000n,
//     jetton: 1_000_000n,
//     dollar: 1_000_000_000n
// };
//
// export const jettonWallets = {
//     usdt: 'kQAj56jyNXX3MdKAbnji56rmrMNciNhf27qbfrACENw-nVtt',
//     usdc: 'kQDFMVJkWrK6yWxHzcBx3kMUVW9WOe6YsMkAlGJDFtt_YEQn',
// }
//
// export const iotaEndpoint = "https://api.stardust-mainnet.iotaledger.net";
// export const NFT_ID = "0x98f8eb12127ee205a7b84e6910021e1e65ec5c8d92f89acdffea7be20104e899"
//
// export const serviceChatID = -4021802986;



// ------------------ Mainnet Config ------------------

export const evaaMaster = Address.parse('EQC8rUZqR_pWV1BylWUlPNBzyiTYVoBEmQkMIQDZXICfnuRr');
export const AssetID = {
    ton: 11876925370864614464799087627157805050745321306404563164673853337929163193738n,
    usdt: 50850501484409962260436158254568659042079041098295833093775185384452361044705n,
    usdc: 59757588766621668873077634021023468123869778502582394337130388226650466113215n,
};
export const rpcEndpoint = 'https://tonrpc.sepezho.com/api/v2/jsonRPC';
export const tonApiEndpoint = 'https://tonapi.io/';
export const isTestnet = false;

export const decimals = {
    ton: 1_000_000_000n,
    jetton: 1_000_000n,
    dollar: 1_000_000_000n
};

export const jettonWallets = {
    usdt: 'kQAj56jyNXX3MdKAbnji56rmrMNciNhf27qbfrACENw-nVtt',
    usdc: 'kQDFMVJkWrK6yWxHzcBx3kMUVW9WOe6YsMkAlGJDFtt_YEQn',
}

export const iotaEndpoint = "https://api.stardust-mainnet.iotaledger.net";
export const NFT_ID = "0xfb9874544d76ca49c5db9cc3e5121e4c018bc8a2fb2bfe8f2a38c5b9963492f5"

export const serviceChatID = -4021802986;
