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


   
it("share codespace", () => {
    dashboardPage.sharecodespace();
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

 

it("acceptinvite", () => {
  const apiKey = "oLIgTnKuISq9kchV8G2fHwaL2tNBXTEV"; // replace with real key
  const serverId = "grd0mcy3";

  // 1. Get the list of messages (latest emails)
  cy.request({
    method: "GET",
    url: `https://mailosaur.com/api/messages?server=${serverId}`,
    headers: {
      Authorization: `Basic ${btoa(apiKey + ":")}`,
    },
  }).then((listResponse) => {
    expect(listResponse.status).to.eq(200);
    const messages = listResponse.body.items;
    expect(messages.length).to.be.greaterThan(0);

    // 2. Fetch the full message by ID
    const newestEmailId = messages[0].id;
    cy.request({
      method: "GET",
      url: `https://mailosaur.com/api/messages/${newestEmailId}`,
      headers: {
        Authorization: `Basic ${btoa(apiKey + ":")}`,
      },
    }).then((msgResponse) => {
      expect(msgResponse.status).to.eq(200);
      const email = msgResponse.body;

      // Log subject
      cy.log("Subject:", email.subject);

      // Log email body (prefer HTML, fallback to text)
      const emailBody = email.html?.body || email.text?.body || "";
      cy.log("Body snippet:", emailBody.substring(0, 200));

      // Extract invite link
      let inviteLink =
        email.html?.links?.[0]?.href || email.text?.links?.[0]?.href;

      if (!inviteLink) {
        // fallback regex
        const regex = /(https:\/\/rtc-editor\.netlify\.app\/codespace\/sharebyemail\/[a-z0-9-]+)/i;
        const match = emailBody.match(regex);
        inviteLink = match?.[0];
      }

      expect(inviteLink, "Invite link should exist").to.not.be.undefined;
      cy.log("Invite link:", inviteLink);

      // 3. Visit the invite link to simulate accepting
      cy.visit(inviteLink);
      cy.wait(8000);
      cy.get('.space-y-3 > .w-full').click();
      cy.wait(5000);
    });
  });
});


it("deletecodespace",()=>{
    dashboardPage.deletecodespace();
});



