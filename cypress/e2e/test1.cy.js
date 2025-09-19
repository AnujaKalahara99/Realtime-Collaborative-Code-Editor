// RTC-Editor Frontend E2E Tests

import { Loginpage } from "./pages/login";
import { dashboardpage } from "./pages/dashboard";
const dashboardPage = new dashboardpage();
const loginPage = new Loginpage();

it('Visits homepage and checks UI', () => {
    cy.visit('http://localhost:5173')
    cy.get('.text-4xl').should('have.text', 'Real-Time Collaborative Code Editor')
    cy.contains('Sign In').click();
    loginPage.enterusername("fernandomatheesha@gmail.com");
    loginPage.enterpassword("kevith");
    loginPage.enterlogin();
    dashboardPage.createcodespace();
    dashboardPage.deletecodespace();

})
