// RTC-Editor Frontend E2E Tests

import { Loginpage } from "./pages/login";
import { dashboardpage } from "./pages/dashboard";
import { codeSpaceElements } from "./pages/codespace";
const dashboardPage = new dashboardpage();
const loginPage = new Loginpage();
const codeSpaceelements = new codeSpaceElements();

beforeEach(() => {
    cy.visit('https://rtc-editor.netlify.app/');
    cy.get('.text-4xl').should('have.text', 'Real-Time Collaborative Code Editor');
    cy.contains('Sign In').click();
    loginPage.enterusername("fernandomatheesha@gmail.com");
    loginPage.enterpassword("kevith");
    loginPage.enterlogin();
});

it('Visits homepage and checks UI', () => {
    // The login steps are now handled in beforeEach
});

it('creates a new codespace', () => {
    dashboardPage.createcodespace();
});

it("dashboard and codespace functionality", () => {
   
    codeSpaceelements.openCodeSpace();
    codeSpaceelements.createfile();

}


);

it ("rename codespace", () => {
    dashboardPage.renamecodespace();});

    
it("share codespace", () => {
    dashboardPage.sharecodespace();
});


it("deletecodespace",()=>{
    dashboardPage.deletecodespace();
});


