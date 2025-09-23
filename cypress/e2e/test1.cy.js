// RTC-Editor Frontend E2E Tests

import { Loginpage } from "./pages/login";
import { dashboardpage } from "./pages/dashboard";
import { codeSpaceElements } from "./pages/codespace";
const dashboardPage = new dashboardpage();
const loginPage = new Loginpage();
const codeSpaceelements = new codeSpaceElements();

beforeEach(() => {
    cy.visit('http://localhost:5173');
    cy.get('.text-4xl').should('have.text', 'Real-Time Collaborative Code Editor');
    cy.contains('Sign In').click();
    loginPage.enterusername("fernandomatheesha@gmail.com");
    loginPage.enterpassword("kevith");
    loginPage.enterlogin();
});

it('Visits homepage and checks UI', () => {
    // The login steps are now handled in beforeEach
});

it("dashboard and codespace", () => {
    //dashboardPage.createcodespace();
    // dashboardPage.deletecodespace();
    codeSpaceelements.openCodeSpace();
    codeSpaceelements.createfile();

});
