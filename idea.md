### User flow - backend

- Authentication
  [x] User sign up
  [x] User Login
  [x] Middleware
- CRUD Expenses
  - Add Expense
  - Remove existing Expenses
  - Update existing Expenses
- List Expenses
  - List all Expenses
  - Add Filter by
    - Last week
    - Last Month
    - Last 3 Months
    - Custom (A start and an end date)
- Other details
  - All the routes will be protected (basic)
  - Add categories for all the expenses

### Ideas to be built on top of it

- Authentication
  - Handle password reset
  - Third party authentiation
- Export option
  - Export options csv and pdf
- Add tagging options (Friends, Family, Work, Vacation)
- Add custom categories option
- Recurring expenses and subscriptions
- Insights and visualization
- Multi currency support

### Future scope

- Add AI insights

### Data model

- Entites
  - users
  - expenses
  - category
- Entity with attributes
  - users
    - id - primary key
    - name
    - username - unique
    - email - unique
    - password - hashed
    - created_at
  - expenses
    - id - primary key
    - title
    - amount
    - user_id - references users(id)
    - created_at
    - updated_at
  - categories
    - id - primary key
    - user_id - references users(id) default NULL
    - category_name
  - expense_categories
    - id - primary key
    - expense_id - references expenses(id)
    - category_id - references categories(id)

### Dummy userdata

```
[{"name":"Alexandre Veum","username":"alexandre_veum","email":"alexandre_veum45@hotmail.com","password":"emQn_TLnLtD7DTg"},{"name":"Serenity Block","username":"serenity_block","email":"serenity_block72@yahoo.com","password":"_570ygBOr8mvfMP"},{"name":"Kamren Turcotte","username":"kamren_turcotte","email":"kamren.turcotte76@yahoo.com","password":"iIYaojZ7vzbkOZv"},{"name":"Jaleel Dicki","username":"jaleel_dicki86","email":"jaleel.dicki39@hotmail.com","password":"RRtlu1dNVmPfioo"},{"name":"Leda Tromp","username":"leda.tromp","email":"leda_tromp47@gmail.com","password":"yjAY0ftIaQuZgGw"}]

```
