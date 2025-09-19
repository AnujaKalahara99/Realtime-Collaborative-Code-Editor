export class Loginpage{
    enterusername(){
        cy.get('#email').type("fernandomatheesha@gmail.com")
    }

    enterpassword(){
        cy.get('#password').type("kevith")
    }

    enterlogin(){
        cy.get('.bg-blue-600').click()
    }
}