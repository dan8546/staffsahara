-- RMTC Migration: Simple update for any existing RRTC badges to RMTC

-- Update candidate_badges badge_type if any RRTC badges exist
UPDATE candidate_badges 
SET badge_type = 'RMTC-OK' 
WHERE badge_type IN ('RRTC-OK', 'RRTC_OK', 'Rrtc-Ok');

-- Update badge_data JSON if it contains RRTC references  
UPDATE candidate_badges 
SET badge_data = jsonb_set(badge_data, '{code}', '"RMTC-OK"'::jsonb)
WHERE badge_data ? 'code' 
AND badge_data->>'code' IN ('RRTC-OK', 'RRTC_OK', 'Rrtc-Ok');

-- Comment: Migration completed - all RRTC references updated to RMTC