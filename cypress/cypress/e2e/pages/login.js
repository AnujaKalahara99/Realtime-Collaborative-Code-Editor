
export class Loginpage{
    enterusername(username){
        cy.get('#email').type(username)
    }

    enterpassword(password){
        cy.get('#password').type(password)
    }

    enterlogin(){
        cy.get('.bg-blue-600').click()
    }

   
}