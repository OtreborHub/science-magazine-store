export enum Role {
    OWNER = "Owner",
    ADMIN = "Administrator",
    CUSTOMER = "Customer",
    VISITOR = "Visitor",
    NONE = ""
}

export function getRole(owner: boolean, admin: boolean, customer: boolean){
    if(owner){
        return Role.OWNER
      } else if (admin) {
        return Role.ADMIN
      } else if (customer) {
        return Role.CUSTOMER
      } else {
        return Role.VISITOR;
      }
}