describe('Integration Test: Create Codespace + Dashboard', () => {
     beforeEach(() => {

    cy.visit('http://localhost:5173/');
    cy.contains('Sign In').click();
    cy.get('input[type="email"]').type('fernandomatheesha@gmail.com');
    cy.get('input[type="password"]').type('kevith');
    cy.get('button[type="submit"]').click();
 
      cy.intercept('POST', '/codespaces', {
      statusCode: 202,
      body: { id: '123', name: 'IntegrationTestSpaced' }
    }).as('createCodespace');



    cy.intercept('GET', '/codespaces', {
    statusCode: 200,
    body: [
      { id: '123', name: 'IntegrationTestSpaced' },
      { id: '456', name: 'ExistingSpace' }
    ]
  }).as('getCodespaces');

  });

  

  it('creates a new codespace and verifies it appears in the dashboard', () => {
   

    // Wait for dashboard to load and click only the first matching element
    cy.get('.grid > .bg-gray-800', { timeout: 10000 }).should('be.visible').first().click();

    // Fill form and submit
    cy.get('#workspace-name', { timeout: 10000 }).should('be.visible').type('IntegrationTestSpaced');
    cy.get('.px-6').should('be.visible').click();

    // Wait for mocked codespace creation
    cy.wait('@createCodespace');

    // Verify the new codespace appears in the dashboard
    cy.wait('@getCodespaces');

// Verify it appears in dashboard
  
  });

  // Check codespace in dashboard
 
});

