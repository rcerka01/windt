const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");
const { interface, bytecode } = require("./compile.js");

const provider = new HDWalletProvider(
    "tree vivid duck tomorrow fortune dry increase thrive wave other valid indoor",
    "https://rinkeby.infura.io/v3/a197147b7d74457bacc7fa21c29bc397"
);

const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    const arguments = [1,1,"0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB", "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB", "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB"];
    //const arguments = [1,1,accounts[1],accounts[2],accounts[3]];

    console.log("Attempting to deploy from account: " + accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode, arguments: arguments })
        .send({ gas: "1000000", from: accounts[0] });

    console.log("Contract deployed to " + result.options.address);
}
deploy();
