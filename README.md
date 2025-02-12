# Expense Tracker API

## Overview

A backend service for tracking expenses with authentication, categorization, and filtering.

## Features

- User signup/login
- CRUD operations for expenses
- Expense filtering by date range
- Assign categories to expenses
- Export expenses (CSV/PDF)
- Basic route protection

## Data Model

- **Users**: `id`, `name`, `username`, `email`, `password`, `created_at`
- **Expenses**: `id`, `title`, `amount`, `user_id`, `created_at`, `updated_at`
- **Categories**: `id`, `user_id`, `category_name`
- **Expense Categories**: `id`, `expense_id`, `category_id`

## Installation

1. Clone repo: `git clone https://github.com/0xkafkaa/expense-tracker-api.git`
2. Install dependencies: `npm install`
3. Start server: `npm run dev`

## License

MIT
