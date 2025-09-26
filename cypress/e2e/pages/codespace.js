export class codeSpaceElements {

openCodeSpace(){
cy.get('.grid > .border').click({ multiple: true });}


createfile() {

  cy.get('[title="New File"]', { timeout: 10000 }).click();
  cy.get('.min-h-20 > .flex-1').type("hii boyss");
  cy.get('.p-2').click();
  cy.get(':nth-child(5) > .h-full > .flex.border-gray-600 > :nth-child(2)').click()
  cy.get('.h-full > .flex.border-gray-600 > :nth-child(3)').click()
  cy.get('.inline-flex').click()
  cy.get('.flex-shrink-0 > .flex-1').type("hii")
  cy.get('.inline-flex').click()
  cy.get('[title="New File"]').click();
  cy.wait(4000);
  
  // cy.get(':nth-child(1) > .py-1 > .flex > .truncate').rightclick();
  // cy.get('.z-50 > :nth-child(4)').click();
 
  // cy.get('input[type="text"], textarea, .z-50 input').first().clear().type('my-new-file.txt');
  cy.get('.truncate').first().click();
  cy.get('.view-line').click().type('console.log("welcome to Rtc code editor")');
  cy.get(':nth-child(1) > .py-1 > .flex > .truncate').rightclick();
  cy.get('.text-red-400').click();
  cy.get('.bg-gray-900 > .gap-3 > .flex').click();






  // cy.get(':nth-child(1) > .py-1 > .flex > .truncate', { timeout: 10000 }).should('exist').click();
  //cy.get(':nth-child(1) > .py-1 > .flex > .truncate').click()
 // cy.get('.py-1 > .flex').click()
  //cy.get(':nth-child(1) > .py-1 > .flex > .truncate').click()
  

}

}
