// cypress/integration/auth.spec.js

describe("User Signup", () => {
  const signupUrl = "http://localhost:3000/auth/signup"; // Your signup endpoint

  it("should successfully sign up a new user", () => {
    const newUser = {
      name: "Logan Paul",
      username: "lowlifelogan",
      email: "loganpaul@example.com",
      password: "passwodrd123",
    };

    cy.request("POST", signupUrl, newUser).its("status").should("eq", 201); // 201 for created
  });

  it("should return 400 if validation fails", () => {
    const invalidUser = {
      name: "John",
      username: "jd",
      email: "invalidemail",
      password: "short",
    };

    cy.request({
      method: "POST",
      url: signupUrl,
      body: invalidUser,
      failOnStatusCode: false, // Prevent Cypress from failing the test on non-2xx status
    })
      .its("status")
      .should("eq", 400); // Bad request for invalid input
  });

  it("should return 409 if user already exists", () => {
    const existingUser = {
      name: "John Doe",
      username: "johndoe123",
      email: "johndoe@example.com",
      password: "password123",
    };

    cy.request({
      method: "POST",
      url: signupUrl,
      body: existingUser,
      failOnStatusCode: false,
    })
      .its("status")
      .should("eq", 409); // Conflict if user already exists
  });
});

describe("User Login", () => {
  const loginUrl = "http://localhost:3000/auth/login"; // Your login endpoint

  it("should successfully log in with correct credentials", () => {
    const validUser = {
      email: "loganpaul@example.com",
      password: "passwodrd123",
    };

    cy.request("POST", loginUrl, validUser).its("status").should("eq", 200); // 200 OK for successful login
  });

  it("should return 400 if user does not exist", () => {
    const invalidUser = {
      email: "nonexistent@example.com",
      password: "password123",
    };

    cy.request({
      method: "POST",
      url: loginUrl,
      body: invalidUser,
      failOnStatusCode: false,
    })
      .its("status")
      .should("eq", 400); // Bad request if user does not exist
  });

  it("should return 401 if password is incorrect", () => {
    const invalidPasswordUser = {
      email: "johndoe@example.com",
      password: "wrongpassword",
    };

    cy.request({
      method: "POST",
      url: loginUrl,
      body: invalidPasswordUser,
      failOnStatusCode: false,
    })
      .its("status")
      .should("eq", 401); // Unauthorized if password is incorrect
  });
});
