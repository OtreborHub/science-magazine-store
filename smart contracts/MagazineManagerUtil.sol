// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

library MagazineUtils {
    
    struct Magazine {
        address magazine_address;
        string title;
        uint release_date;    
    }   

    function searchMagazine(Magazine[] memory self, address magazine_address) internal pure returns (bool present, uint index, bool released) {
        for(uint idx = 0; idx < self.length; idx++){
            if(self[idx].magazine_address == magazine_address) {
                return (true, idx, self[idx].release_date > 0);
            }
        }

        return (false, self.length, false);
    }

    function addMagazine(Magazine[] storage self, string memory title) internal returns(address new_magazine_address){
        MagazineUtils.Magazine memory newMagazine;
        uint previousLength = self.length;
        new_magazine_address = generateAddress(title);

        (bool present ,, ) = searchMagazine(self, new_magazine_address);
        require ( present == false, "Magazine already present");

        newMagazine.magazine_address = new_magazine_address;
        newMagazine.title = title;
        newMagazine.release_date = 0;
        self.push(newMagazine);

        bool added = self.length > previousLength;
        require(added == true, "Magazine not added");

    }

    function generateAddress(string memory value) private pure returns(address){
        return address(uint160(uint256(keccak256(abi.encodePacked(value)))));
    }

}

library CustomerUtils {
    
    struct Customer {
        address customer_address;
        address[] owned_magazines;
        bool subscription;
        uint expire_date;
    }

    function searchCustomer(Customer[] memory self, address customer_address) internal pure returns (bool present, uint index, bool subscription) {
        for(uint idx = 0; idx < self.length; idx++){
            if(self[idx].customer_address == customer_address) {
                return (true, idx, self[idx].subscription);
            }
        }

        return (false, self.length, false);
    }

    function searchCustomerMagazine(Customer[] memory self, uint customer_idx, address magazine_address) internal pure returns(bool present) {
        for(uint idx = 0; idx < self[customer_idx].owned_magazines.length; idx++){
            if(self[customer_idx].owned_magazines[idx] == magazine_address){
                return true;
            }
        }

        return false;
    }

    function addSubscriptionForCustomer(Customer[] storage self, uint customer_idx) internal returns(bool updated){
        self[customer_idx].subscription = true;
        self[customer_idx].expire_date = (block.timestamp + 365 days) * 1000;
        updated = true;
    }

    function removeSubscriptionForCustomer(Customer[] storage self, uint customer_idx) internal returns(bool updated){
        self[customer_idx].subscription = false;
        self[customer_idx].expire_date = 0;
        updated = true;
    }

    function addMagazineForCustomer(Customer[] storage self, uint customer_idx, address magazine_address) internal returns(bool updated){
        self[customer_idx].owned_magazines.push(magazine_address);
        updated = true;
    }

    function addSubscriptionForNewCustomer(Customer[] storage self, address customer_address) internal returns(bool added) {
        CustomerUtils.Customer memory newCustomer;
        newCustomer.customer_address = customer_address;
        newCustomer.subscription = true;
        newCustomer.expire_date = block.timestamp + 365 days;
        self.push(newCustomer);

        added = true;
    }

    function addMagazineForNewCustomer(Customer[] storage self, address customer_address, address magazine_address) internal returns(bool added){
        CustomerUtils.Customer memory newCustomer;
        newCustomer.customer_address = customer_address;
        newCustomer.subscription = false;
        newCustomer.expire_date = 0;
        self.push(newCustomer);
        addMagazineForCustomer(self, self.length - 1, magazine_address);

        added = true;
    }
}

library AddressUtils {

    function searchAdmin(address[] memory self, address administrator_address) internal pure returns (bool present, uint index) {
        for(uint idx = 0; idx < self.length; idx++){
            if(self[idx] == administrator_address) {
                return (true, idx);
            }
        }

        return (false, self.length);
    }
}