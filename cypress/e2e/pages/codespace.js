export class codeSpaceElements {

openCodeSpace(){
cy.get('.grid > .border').click({ multiple: true });}


createfile() {
  // Add Cypress commands to create a file here
  // Example: cy.get('[data-cy="create-file-button"]').click();
  cy.get('[title="New File"]', { timeout: 10000 }).click();
  cy.get('.min-h-20 > .flex-1').type("hii boyss");
  cy.get('.p-2').click();
  cy.get(':nth-child(5) > .h-full > .flex.border-gray-600 > :nth-child(2)').click()
  cy.get('.h-full > .flex.border-gray-600 > :nth-child(3)').click()
  cy.get('.inline-flex').click()
  cy.get('.flex-shrink-0 > .flex-1').type("hii")
  cy.get('.inline-flex').click()
//   cy.get('.gap-3 > .flex').click({ multiple: true })
// cy.get('.gap-3 > .flex').click({ multiple: true })}
  //cy.get('[title="New File"] > .lucide > [d="M14 2v4a2 2 0 0 0 2 2h4"]').click();
  cy.get('[title="New File"]').click();
  
  // cy.get(':nth-child(1) > .py-1 > .flex > .truncate').type("file1.txt");
  // cy.get('.truncate').click();
  cy.get(':nth-child(1) > .py-1 > .flex > .truncate').rightclick();
  cy.get('.z-50 > :nth-child(4)').click();
  // Type into the input that appears after clicking the context menu item
  cy.get('input[type="text"], textarea, .z-50 input').first().clear().type('my-new-file.txt');
  cy.get('.py-1 > .flex').click()
  cy.get(':nth-child(1) > .py-1 > .flex > .truncate').click()
  cy.get('.mtk1').type("hiii")

}}
