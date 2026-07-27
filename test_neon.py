import os
import urllib.parse
import psycopg2

db_url = "postgresql://neondb_owner:npg_m3Hjc0YpBWtz@ep-soft-surf-az1hkust-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

try:
    conn = psycopg2.connect(db_url, connect_timeout=10)
    cur = conn.cursor()
    cur.execute("UPDATE \"Profile\" SET educations = %s, certifications = %s, languages = %s WHERE id = 'profile-vi'", ('[]', '[]', '[]'))
    conn.commit()
    print("Update OK")
except Exception as e:
    print(f"Error: {e}")

