-- Custom SQL migration file, put your code below! --
-- Insert default categories with user_id set to NULL
INSERT INTO categories (id, user_id, category_name) VALUES
  (gen_random_uuid(), NULL, 'Food'),
  (gen_random_uuid(), NULL, 'Transport'),
  (gen_random_uuid(), NULL, 'Entertainment'),
  (gen_random_uuid(), NULL, 'Utilities'),
  (gen_random_uuid(), NULL, 'Healthcare'),
  (gen_random_uuid(), NULL, 'Shopping'),
  (gen_random_uuid(), NULL, 'Rent'),
  (gen_random_uuid(), NULL, 'Education'),
  (gen_random_uuid(), NULL, 'Savings'),
  (gen_random_uuid(), NULL, 'Insurance'),
  (gen_random_uuid(), NULL, 'Subscriptions'),
  (gen_random_uuid(), NULL, 'Travel'),
  (gen_random_uuid(), NULL, 'Gifts'),
  (gen_random_uuid(), NULL, 'Miscellaneous');
