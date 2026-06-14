-- V4: Activate all existing pending users for seamless testing
UPDATE users SET status = 'ACTIVE' WHERE status = 'PENDING';
