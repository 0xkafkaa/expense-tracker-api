describe("Expense API Tests", () => {
  const baseUrl = "http://localhost:3000";
  let expenseId;

  beforeEach(() => {
    cy.session("loginSession", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/auth/login`,
        body: {
          email: "loganpaul@example.com",
          password: "passwodrd123",
        },
      }).then((response) => {
        // Extract token from Set-Cookie header
        const setCookieHeader = response.headers["set-cookie"];
        const tokenMatch = setCookieHeader[0].match(/token=([^;]+)/);
        if (tokenMatch) {
          const token = tokenMatch[1];
          cy.setCookie("token", token);
        } else {
          throw new Error("Token not found in Set-Cookie header");
        }
      });
    });
  });

  it("should add an expense successfully", () => {
    cy.getCookie("token").then((cookie) => {
      expect(cookie).to.have.property("value");

      cy.request({
        method: "POST",
        url: `${baseUrl}/expense/add`,
        headers: {
          Cookie: `token=${cookie.value}`,
        },
        body: {
          title: "Groceries",
          amount: 50,
          category: "Food",
          date: "2020-01-01",
        },
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.status).to.eq("success");
        // expect(response.body).to.have.property("expenseId");
        // expenseId = response.body.expenseId;
      });
    });
  });

  it("should fail to add an expense with invalid data", () => {
    cy.getCookie("token").then((cookie) => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/expense/add`,
        headers: {
          Cookie: `token=${cookie.value}`,
        },
        body: {
          title: "",
          amount: -10,
          category: "A",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.status).to.eq("failure"); // Fixed typo
      });
    });
  });

  it("should fail to delete a non-existing expense", () => {
    cy.getCookie("token").then((cookie) => {
      cy.request({
        method: "DELETE",
        url: `${baseUrl}/expense/delete`,
        headers: {
          Cookie: `token=${cookie.value}`,
        },
        body: {
          expenseId: "00000000-0000-0000-0000-000000000000",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body.status).to.eq("failure");
      });
    });
  });

  it("should delete an expense successfully", () => {
    cy.getCookie("token").then((cookie) => {
      cy.request({
        method: "DELETE",
        url: `${baseUrl}/expense/delete`,
        headers: {
          Cookie: `token=${cookie.value}`,
        },
        body: {
          expenseId: "f7af86a3-ff23-4ae7-b563-69a7c5215928",
        },
      }).then((response) => {
        expect(response.status).to.eq(204);
      });
    });
  });
});
