pragma solidity ^0.4.17;

contract WindT {
    
    address public admin;
    // must change for multiple tokens
    address[] private partners;
    address private contractors;  // 3 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db
    address private continuance;  // 2 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2 
    // likely will be cash account
    address private powerPlant;   // 4 0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB

    // set on creation
    uint public projectValue;
    uint public tokenValue;
    uint public tokensTotal;

    // set yearly
    // all costs in ETHER
    uint public serviceCost;
    uint public platformCost;
    uint public maintanenceCost;
    uint public taxCost;
    uint public insuranceCost;
    uint public utilityCost;
    
    function WindT(uint initialProjectValue, uint initialTokensTotal, address toContractors, address toContinuance, address toPowerPlant) public {
        admin = msg.sender;
        projectValue = initialProjectValue * 1000000000000000000;
        tokensTotal = initialTokensTotal;
        tokenValue = projectValue / tokensTotal;
        contractors = toContractors;
        continuance = toContinuance;
        powerPlant = toPowerPlant;
    }
    
    // updated once a year?
    function setAnualCosts(uint service, uint platform, uint maintanence, uint tax, uint insurance, uint utility) public restrictedToAdmin {
        serviceCost = service * 1000000000000000000;
        platformCost = platform * 1000000000000000000;
        maintanenceCost = maintanence * 1000000000000000000;
        taxCost = tax * 1000000000000000000;
        insuranceCost = insurance * 1000000000000000000;
        utilityCost = utility * 1000000000000000000;
    }
    
    // not needed, just transfear wai to eth
    function getTokenValue() public view returns (uint) {
        return tokenValue / 1000000000000000000;
    }

    function getPartners() public view returns (address[]) {
        return partners;
    }
    
    function getBalance() public view returns (uint) {
        // convert more colin 
        return  address(this).balance / 1000000000000000000;
    } 
    
    // function which will take all balance when collected, and transfear somehere (to contractors)
    // and services to us :) 
    function enter() public payable {
        // must be token + gas. How to store founds, Ethereum?
        require(msg.value >= tokenValue);
        
        partners.push(msg.sender);
        
        if ( address(this).balance >= projectValue ) {
            contractors.transfer(address(this).balance);
        }
    }
    
    function gravy() payable public restrictedToPowerPlant {
        require(msg.value > 0);

        uint payment = calculateGravyPerToken(msg.value);
        
        for (uint i=0; i<partners.length; i++) {
           partners[i].transfer(payment);
        }
        
        continuance.transfer(address(this).balance);
    }
    
    modifier restrictedToAdmin() {
        require(msg.sender == admin);
        _;
    }
      
    modifier restrictedToPowerPlant() {
        require(msg.sender == powerPlant);
        _;
    }  
    
    // des pow comp will pay monthly?
    // so, will we pay monthly? good to show that we are still alive
    function calculateGravyPerToken(uint monthlyIncome) private view returns (uint) {
       return ( monthlyIncome - calculateMonthlyCosts() ) / tokensTotal;
    }

    function calculateMonthlyCosts() private view returns (uint)  {
        uint yearlyCosts = 
            serviceCost + 
            platformCost + 
            maintanenceCost + 
            taxCost +                                                                                     
            insuranceCost +
            utilityCost;
        return yearlyCosts / 12;
    }
}
