export class dashboardpage{
     
    createcodespace(){
    cy.get('.grid > .bg-gray-800').click()
    cy.get('#workspace-name').type("testcodespace")
    cy.get('.px-6').click()
    }

    deletecodespace(){
     cy.get('.transition-all > :nth-child(2) > .cursor-pointer').click();
     cy.get('.text-red-600').click()
    }

    editcodespace(){
       cy.get('.transition-all > :nth-child(2) > .cursor-pointer').click();    }


    sharecodespace(){   
        cy.get('.transition-all > :nth-child(2) > .cursor-pointer').click();
        cy.get('.transition-all > :nth-child(2) > .bg-gray-800 > :nth-child(2)').click();
        cy.get('.w-full.mb-4').click().type("rodrigosunath@gmail.com");
        cy.get('.px-6').click();
        cy.wait(3000);
       }
  
     renamecodespace(){
        cy.get('.transition-all > :nth-child(2) > .cursor-pointer').click();
        cy.get('.transition-all > :nth-child(2) > .bg-gray-800 > :nth-child(1)').click();
        cy.get('.p-6 > .w-full').click().type("renamedcodespace");
        cy.get('.px-6').click();
        cy.wait(3000)

     }  

}