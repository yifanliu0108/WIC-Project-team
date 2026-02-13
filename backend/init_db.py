"""
Database initialization script
Run this to create all database tables

Usage:
    python init_db.py
"""
import sys
from app.core.database import engine, Base
from app.core.config import settings
from app.models.user import User
from app.models.song import Song
from app.models.connection import Connection

def detect_database_backend(database_url: str) -> str:
    """Return normalized backend name from SQLAlchemy DATABASE_URL."""
    if database_url.startswith("sqlite"):
        return "sqlite"
    if database_url.startswith("postgres"):
        return "postgresql"
    return "other"

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
        database_url = settings.DATABASE_URL
        database_backend = detect_database_backend(database_url)

        print(f"❌ Error creating database tables: {e}")
        print(f"\nDetected database backend: {database_backend}")
        print("Make sure:")

        if database_backend == "sqlite":
            print("  1. DATABASE_URL in .env points to a writable SQLite file path")
            print("  2. The backend directory is writable")
            print("  3. If intune.db exists, it is not locked by another process")
        elif database_backend == "postgresql":
            print("  1. PostgreSQL is running")
            print("  2. DATABASE_URL in .env is correct")
            print("  3. Database 'intune_db' exists (or create it with: createdb intune_db)")
        else:
            print("  1. DATABASE_URL in .env is correct for your database driver")
            print("  2. Database server is reachable")
            print("  3. Database credentials and permissions are valid")

        return False

if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)
