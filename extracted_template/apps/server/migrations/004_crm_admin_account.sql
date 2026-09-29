-- Make the requested account the sole MedSales CRM administrator.
UPDATE user
SET role = 'user'
WHERE role = 'admin'
  AND lower(email) <> lower('albear.rizkalla@gmail.com');

UPDATE user
SET role = 'admin'
WHERE lower(email) = lower('albear.rizkalla@gmail.com');
