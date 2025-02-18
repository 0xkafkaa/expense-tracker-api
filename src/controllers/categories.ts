/*
Add Categories
- Check user from the request object with the auth middleware
- validate userID and category(userID will be available from the middleware) hence check the category with zod validation
- insert category into db
    - NOT OK => category already exists on the userId
    - OK => insert category in DB
*/
