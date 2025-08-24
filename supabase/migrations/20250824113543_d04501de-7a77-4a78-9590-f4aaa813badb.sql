-- RMTC Migration: Prepare database for RMTC (RedMed Training Center) 
-- Update any potential RRTC references to RMTC

-- Create a function to migrate RRTC badges to RMTC
CREATE OR REPLACE FUNCTION migrate_rrtc_to_rmtc()
RETURNS TABLE(operation text, count integer) AS $$
BEGIN
  -- Check and update candidate_badges if any RRTC badges exist
  UPDATE candidate_badges 
  SET badge_type = 'RMTC-OK' 
  WHERE badge_type IN ('RRTC-OK', 'RRTC_OK', 'Rrtc-Ok');
  
  RETURN QUERY SELECT 'UPDATE candidate_badges'::text, ROW_COUNT::integer;
  
  -- Update badge_data JSON if it contains RRTC references
  UPDATE candidate_badges 
  SET badge_data = jsonb_set(badge_data, '{code}', '"RMTC-OK"'::jsonb)
  WHERE badge_data ? 'code' 
  AND badge_data->>'code' IN ('RRTC-OK', 'RRTC_OK', 'Rrtc-Ok');
  
  RETURN QUERY SELECT 'UPDATE badge_data'::text, ROW_COUNT::integer;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration and display results
SELECT * FROM migrate_rrtc_to_rmtc();