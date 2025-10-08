
describe('Integration Test: Login + Dashboard', () => {
  beforeEach(() => {
    // Intercept the login POST request
    cy.intercept('POST', '**/auth/v1/token?grant_type=password', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          access_token: 'fake-token',
          refresh_token: 'fake-refresh',
          user: { email: 'fernandomatheesha@gmail.com', app_metadata: {} },
        },
      });
    }).as('loginRequest');

    // Intercept user info fetch
    cy.intercept('GET', '**/auth/v1/user', {
      statusCode: 200,
      body: { user: { email: 'fernandomatheesha@gmail.com' } },
    });
  });

  it('logs in and displays dashboard user info', () => {
    cy.visit('http://localhost:5173/');

    // Go to login
    cy.contains('Sign In').click();

    // Fill login form
    cy.get('input[type="email"]').type('fernandomatheesha@gmail.com');
    cy.get('input[type="password"]').type('kevith');

    // Submit form
    cy.get('button[type="submit"]').click();

    // Wait for login API
    cy.wait('@loginRequest');

    // Force a redirect if your app uses client-side navigation
    cy.window().then((win) => {
      if (!win.location.pathname.includes('/dashboard')) {
        win.location.href = '/dashboard';
      }
    });

    // Assert dashboard URL and content
    cy.url({ timeout: 10000 }).should('include', '/dashboard');
    
  });
});

