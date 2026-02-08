"""
Database initialization script
Run this to create all database tables

Usage:
    python init_db.py
"""
import sys
from app.core.database import engine, Base
from app.models.user import User
from app.models.song import Song
from app.models.connection import Connection

def init_database():
    """Initialize database by creating all tables"""
    try:
        print("🔄 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        print("\nTables created:")
        print("  - users")
        print("  - songs")
        print("  - connections")
        return True
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")
        print("\nMake sure:")
        print("  1. PostgreSQL is running")
        print("  2. DATABASE_URL in .env is correct")
        print("  3. Database 'intune_db' exists (or create it with: createdb intune_db)")
        return False

if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)
