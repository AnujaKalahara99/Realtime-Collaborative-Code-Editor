// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import 'cypress-mailslurp';

const config = {
  MAILSLURP_API_KEY: "a7f8faf0b22f90fa7e9342100de7fd2f2e87cc459f09dfcad3d5c2b2a86e3fe4"
};

export default config;