// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;
import "./MagazineManagerUtil.sol";

contract MagazineManager {
    using CustomerUtils for CustomerUtils.Customer[];
    using MagazineUtils for MagazineUtils.Magazine[];
    using AddressUtils for address[];

    MagazineUtils.Magazine[] public magazines;
    CustomerUtils.Customer[] customers;
    address[] administrators;
    address public owner;

    uint public singlePrice = 0.0001 ether;
    uint public annualPrice = (singlePrice * 12) - ((singlePrice * 12)/10);
    
    event BuyOrder(address customer_address, address magazine_address);
    event SubscriptionOrder(address customer_address, uint expire_date);
    event NewMagazine(address magazine_address);
    event ReleaseMagazine(address magazine_address);

    constructor(){
        owner = msg.sender;
        administrators.push(msg.sender);
    }

    function getBalance() public view returns(uint){
        return address(this).balance;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Sender unauthorized");
        _; 
    }

    modifier onlyAdministrators() {
        (bool present, ) = administrators.searchAdmin(msg.sender);
        require(present == true, "Sender unauthorized");
        _; 
    }

    function countMagazines() external view returns(uint) {
        return magazines.length;
    }

    function isCustomer() external view returns(bool, uint, bool){
        return customers.searchCustomer(msg.sender);
    }

    function isAdministrator() external view returns(bool, uint){
        return administrators.searchAdmin(msg.sender);
    }

    function magazinesByCustomer() external view returns(address[] memory ){
        (bool present, uint idx, ) = customers.searchCustomer(msg.sender);
        require(present == true, "Customer not found");
        return customers[idx].owned_magazines;
    }

    function magazineByAddress(address magazine_address) external view returns (MagazineUtils.Magazine memory) {
        (bool present, uint idx, ) = magazines.searchMagazine(magazine_address);
        require(present == true, "Magazine not found");
        return magazines[idx];
    }


    // ---------------------- USER ONLY ----------------------

    function buyMagazine(address magazine_address) external payable {
        require(msg.value >= singlePrice, "Insufficient funds");
        (bool m_present,, bool released ) = magazines.searchMagazine(magazine_address);
        require(m_present == true, "Magazine not found");
        require(released == true, "Magazine not released");

        (bool c_present, uint c_idx, ) = customers.searchCustomer(msg.sender);
        if(c_present){
            (bool cm_present) = customers.searchCustomerMagazine(c_idx, magazine_address);
            require(cm_present == false, "Magazine already owned");
            customers.addMagazineForCustomer(c_idx, magazine_address);
        } else {
            customers.addMagazineForNewCustomer(msg.sender, magazine_address);
        }

        emit BuyOrder(msg.sender, magazine_address);
    }

    function annualSubscribe() external payable {
        require(msg.value >= annualPrice, "Insufficient funds");
       (bool present, uint idx, bool subscription) = customers.searchCustomer(msg.sender);
       require(subscription == false, "Customer already has a subscription" );
       bool success = false;

        if(present){
            success = customers.addSubscriptionForCustomer(idx);
        } else {
            success = customers.addSubscriptionForNewCustomer(msg.sender);
        }

        if(success){
            emit SubscriptionOrder(msg.sender, customers[idx].expire_date);
        }
    }

    function revokeSubscribe() external {
        (bool present, uint idx, bool subscription) = customers.searchCustomer(msg.sender);
        require(present == true, "Customer not found" );
        require(subscription == true, "Customer has no active subscription" );
        customers.removeSubscriptionForCustomer(idx);
    }

    // ---------------------- ADMIN ONLY ----------------------

    function addMagazine(string memory title) external onlyAdministrators {
        address new_magazine_address = magazines.addMagazine(title);
        emit NewMagazine(new_magazine_address);
    }

    function releaseMagazine(address magazine_address) external onlyAdministrators {
        (bool present, uint idx, bool released) = magazines.searchMagazine(magazine_address);
        require(present == true, "Magazine not found");
        require(released == false, "Magazine already released");
        magazines[idx].release_date = block.timestamp * 1000;

        if(customers.length > 0){
            for(uint i = 0; i < customers.length; i++){
                if(customers[i].subscription && customers[i].expire_date > block.timestamp){
                    customers.addMagazineForCustomer(i, magazine_address);
                }
                //Cleaning subscription each magazine release
                if(customers[i].subscription && customers[i].expire_date < block.timestamp){
                    customers.removeSubscriptionForCustomer(i);
                }
            }
        }

        emit ReleaseMagazine(magazines[idx].magazine_address);
    }

    // ---------------------- OWNER ONLY ----------------------

    function addAdmin(address admin_address) external onlyOwner returns(bool success){
        (bool present, ) = administrators.searchAdmin(admin_address);
        require(present == false, "Admin already present");
        administrators.push(admin_address);
        success = true;
    }

    function withdraw(uint amount) external onlyOwner returns(bool success){
        require(address(this).balance >= amount, "Insufficient funds");
        payable(owner).transfer(amount);
        success = true;
    }

    function splitProfit() external onlyOwner returns(bool success){
        require(administrators.length > 0, "Empty administrators list");
        uint split_amount = address(this).balance / administrators.length;
        for(uint idx = 0; idx < administrators.length; idx++){
            payable(administrators[idx]).transfer(split_amount);
        }
        success = true;
    }

    // --------------------------------------------------------

    receive() external payable {}
    
}