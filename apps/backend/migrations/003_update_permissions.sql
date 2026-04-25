-- Update Quality Manager permissions to include leads:approve and leads:edit
UPDATE users
SET permissions = '["leads:view", "leads:approve", "leads:edit", "leads:delete"]'::jsonb
WHERE email = 'quality@enjaz.com';

-- Update sample promoter permissions
UPDATE users
SET permissions = '["leads:create", "leads:view", "attendance:checkin"]'::jsonb
WHERE email = 'promoter@enjaz.com';
