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
}