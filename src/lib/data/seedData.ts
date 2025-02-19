import { faker } from "@faker-js/faker";
import { User } from "../../db/schema";

faker.seed(234);

export const generateUsers = (count: number): User[] => {
  return Array.from({ length: count }, (): User => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${firstName} ${lastName}`;
    const username = faker.internet
      .username({ firstName, lastName })
      .toLowerCase();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const password = faker.internet.password();

    return { name, username, email, password };
  });
};

// console.log(JSON.stringify(generateUsers(1)));
console.log(generateUsers(1));
