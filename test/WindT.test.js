const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require("../compile.js");

let accounts;
let contract;

beforeEach( async () => {
  // get all accounts
  accounts = await web3.eth.getAccounts();

  const arguments = [3,3,accounts[1],accounts[2],accounts[3]];

  // deploy contract onto first account
  contract = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode, arguments: arguments })
    .send({ from: accounts[0], gas: 1000000 });
});

describe("WindT", () => {
    it("deploys contract", () => {
        assert.ok(contract.options.address);
    });

    it("alowe one partner to enter", async () => {
      await contract.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei("1", "ether")
      });

      const partners = await contract.methods.getPartners().call();
      
      assert.equal(partners[0], accounts[0]);
      assert.equal(partners.length, 1);
    });


    it("alowe multiple partners to enter", async () => {
      await contract.methods.enter().send({
        from: accounts[4],
        value: web3.utils.toWei("1", "ether")
      });
      await contract.methods.enter().send({
        from: accounts[5],
        value: web3.utils.toWei("1", "ether")
      });
      await contract.methods.enter().send({
        from: accounts[6],
        value: web3.utils.toWei("1", "ether")
      });

      const partners = await contract.methods.getPartners().call();
      
      assert.equal(partners[0], accounts[4]);
      assert.equal(partners[1], accounts[5]);
      assert.equal(partners[2], accounts[6]);
      assert.equal(partners.length, 3);
    });

    it("requires amount of ether no less than token value", async () => {
      try {
        await contract.methods.enter().send({
          from: accounts[0],
          value: web3.utils.toWei("0.9", "ether")
        });
        assert(false);
      }
      catch(err) {
        assert(err);
      }
    });

    it("only admin can set anual costs", async () => {
      try {
        await lottery.methods.setAnualCosts().call({
          from: accounts[1]
        });
        assert(false);
      }
      catch(err) {
        assert(err);
      }
    });

    it("only power plant can emit the gravy", async () => {
      try {
        await lottery.methods.gravy().call({
          from: accounts[0]
        });
        assert(false);
      }
      catch(err) {
        assert(err);
      }
    });

    it("sends monay to contractors and resets the balance", async () => {
      const initialBalance = await web3.eth.getBalance(accounts[1]);

      await contract.methods.enter().send({
        from: accounts[4],
        value: web3.utils.toWei("1", "ether")
      });
      await contract.methods.enter().send({
        from: accounts[5],
        value: web3.utils.toWei("1", "ether")
      });
      await contract.methods.enter().send({
        from: accounts[6],
        value: web3.utils.toWei("1", "ether")
      });

      const finalBalance = await web3.eth.getBalance(accounts[1]);
      const difference = finalBalance - initialBalance;

      assert(difference == web3.utils.toWei("3", "ether"));
    });

    it("sets anual costs, sends gravy to partners and funds continuance", async () => {
      await contract.methods.enter().send({
        from: accounts[4],
        value: web3.utils.toWei("1", "ether")
      });
      await contract.methods.enter().send({
        from: accounts[5],
        value: web3.utils.toWei("1", "ether")
      });
      await contract.methods.enter().send({
        from: accounts[6],
        value: web3.utils.toWei("1", "ether")
      });

      await contract.methods.setAnualCosts(1,1,1,1,1,1).send({ from: accounts[0], gas: 1000000 });

      const taxCost = await contract.methods.taxCost().call();
      const serviceCost = await contract.methods.serviceCost().call();
      const platformCost = await contract.methods.platformCost().call();
      const maintanenceCost = await contract.methods.maintanenceCost().call();
      const insuranceCost = await contract.methods.insuranceCost().call();
      const utilityCost = await contract.methods.utilityCost().call();

      assert(taxCost == web3.utils.toWei("1", "ether"));
      assert(serviceCost == web3.utils.toWei("1", "ether"));
      assert(platformCost == web3.utils.toWei("1", "ether"));
      assert(maintanenceCost == web3.utils.toWei("1", "ether"));
      assert(insuranceCost == web3.utils.toWei("1", "ether"));
      assert(utilityCost == web3.utils.toWei("1", "ether"));

      const initialBalance1 = await web3.eth.getBalance(accounts[4]);
      const initialBalance2 = await web3.eth.getBalance(accounts[5]);
      const initialBalance3 = await web3.eth.getBalance(accounts[6]);
      const initialBalanceContinuance = await web3.eth.getBalance(accounts[2]);

      await contract.methods.gravy().send({
        from: accounts[3],
        value: web3.utils.toWei("6.5", "ether")
      });

      const finalBalance1 = await web3.eth.getBalance(accounts[4]);
      const finalBalance2 = await web3.eth.getBalance(accounts[5]);
      const finalBalance3 = await web3.eth.getBalance(accounts[6]);
      const finalBalanceContinuance = await web3.eth.getBalance(accounts[2]);

      const difference1 = finalBalance1 - initialBalance1;
      const difference2 = finalBalance2 - initialBalance2;
      const difference3 = finalBalance3 - initialBalance3;
      const differenceContinuance = finalBalanceContinuance - initialBalanceContinuance;
      
      assert(difference1 == web3.utils.toWei("2", "ether"));
      assert(difference2 == web3.utils.toWei("2", "ether"));
      assert(difference3 == web3.utils.toWei("2", "ether"));
      assert(differenceContinuance == web3.utils.toWei("0.5", "ether"));
    });
});
