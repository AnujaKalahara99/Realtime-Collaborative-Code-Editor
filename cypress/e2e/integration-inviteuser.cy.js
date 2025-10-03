import { Loginpage } from "./pages/login";

// If you have a page object for the invite dialog, import it here
// import { inviteUserPage } from '../pages/inviteUserPage';

const loginPage = new Loginpage();

describe('Integration Test: Invite User by Email', () => {
  beforeEach(() => {
    cy.visit('https://rtc-editor.netlify.app');
    cy.get('.text-4xl').should('have.text', 'Real-Time Collaborative Code Editor');
    cy.contains('Sign In').click();
    loginPage.enterusername("fernandomatheesha@gmail.com");
    loginPage.enterpassword("kevith");
    loginPage.enterlogin();
  });

  it('invites a user by email from dashboard', () => {
    cy.wait(2000); // Wait for login to complete

    // Check if codespace element exists before proceeding
    cy.get('body').then($body => {
      if ($body.find('.transition-all > :nth-child(2) > .cursor-pointer').length) {
        cy.get('.transition-all > :nth-child(2) > .cursor-pointer').click();
        cy.get('.transition-all > :nth-child(2) > .bg-gray-800 > :nth-child(2)').click();
        cy.get('.w-full.mb-4').click().type("rodrigosunath@gmail.com");
        cy.intercept('POST', /.*\/codespaces\/.*\/sharebyemail/, {
          statusCode: 200,
          body: { message: "Invitation sent successfully" }
        }).as('shareCodespace');
        cy.get('.px-6').click();
        cy.wait('@shareCodespace');
        cy.get('[data-testid="invite-success-msg"]').should('contain', 'Invitation sent successfully');
      } else {
        // Pause the test and log a message if no codespace is found
        cy.log('No codespace found, test paused');
        cy.pause();
      }
    });
  });
});
