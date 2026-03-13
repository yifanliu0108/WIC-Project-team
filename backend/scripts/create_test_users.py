"""
Script to create test users with varied music preferences for testing
recommendation algorithm and network visualization
"""
import sys
import os

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.models.song import Song
from app.models.connection import Connection, ConnectionStatus
from app.core.security import get_password_hash
import random

# Test user data with varied music preferences
TEST_USERS = [
    {
        "username": "alex_pop",
        "email": "alex@test.com",
        "password": "test123",
        "bio": "Love pop and rock music!",
        "genres": ["POP", "ROCK", "INDIE"],
        "artists": ["Taylor Swift", "The Weeknd", "Harry Styles", "Ed Sheeran", "Billie Eilish"],
        "songs": [
            {"title": "Blinding Lights", "artist": "The Weeknd", "genre": "POP", "rating": 5, "favorite": True},
            {"title": "As It Was", "artist": "Harry Styles", "genre": "POP", "rating": 5, "favorite": True},
            {"title": "Anti-Hero", "artist": "Taylor Swift", "genre": "POP", "rating": 5, "favorite": True},
            {"title": "Shape of You", "artist": "Ed Sheeran", "genre": "POP", "rating": 4, "favorite": False},
            {"title": "Bad Guy", "artist": "Billie Eilish", "genre": "POP", "rating": 4, "favorite": False},
            {"title": "Watermelon Sugar", "artist": "Harry Styles", "genre": "POP", "rating": 4, "favorite": False},
            {"title": "Starboy", "artist": "The Weeknd", "genre": "POP", "rating": 4, "favorite": False},
            {"title": "Levitating", "artist": "Dua Lipa", "genre": "POP", "rating": 3, "favorite": False},
        ]
    },
    {
        "username": "maya_hiphop",
        "email": "maya@test.com",
        "password": "test123",
        "bio": "Hip-hop and R&B enthusiast",
        "genres": ["HIP-HOP", "R&B", "RAP"],
        "artists": ["Drake", "Kendrick Lamar", "The Weeknd", "SZA", "J. Cole"],
        "songs": [
            {"title": "Starboy", "artist": "The Weeknd", "genre": "R&B", "rating": 5, "favorite": True},
            {"title": "God's Plan", "artist": "Drake", "genre": "HIP-HOP", "rating": 5, "favorite": True},
            {"title": "HUMBLE.", "artist": "Kendrick Lamar", "genre": "HIP-HOP", "rating": 5, "favorite": True},
            {"title": "Blinding Lights", "artist": "The Weeknd", "genre": "R&B", "rating": 4, "favorite": False},
            {"title": "Good 4 U", "artist": "Olivia Rodrigo", "genre": "POP", "rating": 3, "favorite": False},
            {"title": "No Role Modelz", "artist": "J. Cole", "genre": "HIP-HOP", "rating": 4, "favorite": False},
            {"title": "Kill Bill", "artist": "SZA", "genre": "R&B", "rating": 4, "favorite": False},
        ]
    },
    {
        "username": "sam_indie",
        "email": "sam@test.com",
        "password": "test123",
        "bio": "Indie and alternative vibes",
        "genres": ["INDIE", "ALTERNATIVE", "ROCK"],
        "artists": ["Arctic Monkeys", "Tame Impala", "The Strokes", "Phoebe Bridgers", "Mac DeMarco"],
        "songs": [
            {"title": "Do I Wanna Know?", "artist": "Arctic Monkeys", "genre": "INDIE", "rating": 5, "favorite": True},
            {"title": "The Less I Know The Better", "artist": "Tame Impala", "genre": "INDIE", "rating": 5, "favorite": True},
            {"title": "Last Nite", "artist": "The Strokes", "genre": "ALTERNATIVE", "rating": 4, "favorite": False},
            {"title": "Kyoto", "artist": "Phoebe Bridgers", "genre": "INDIE", "rating": 4, "favorite": False},
            {"title": "Chamber of Reflection", "artist": "Mac DeMarco", "genre": "INDIE", "rating": 4, "favorite": False},
            {"title": "As It Was", "artist": "Harry Styles", "genre": "POP", "rating": 3, "favorite": False},
        ]
    },
    {
        "username": "jordan_country",
        "email": "jordan@test.com",
        "password": "test123",
        "bio": "Country music lover",
        "genres": ["COUNTRY", "FOLK", "AMERICANA"],
        "artists": ["Luke Combs", "Morgan Wallen", "Taylor Swift", "Zach Bryan", "Kacey Musgraves"],
        "songs": [
            {"title": "Beautiful Crazy", "artist": "Luke Combs", "genre": "COUNTRY", "rating": 5, "favorite": True},
            {"title": "Wasted on You", "artist": "Morgan Wallen", "genre": "COUNTRY", "rating": 5, "favorite": True},
            {"title": "Anti-Hero", "artist": "Taylor Swift", "genre": "POP", "rating": 4, "favorite": False},
            {"title": "Something in the Orange", "artist": "Zach Bryan", "genre": "COUNTRY", "rating": 4, "favorite": False},
            {"title": "Follow Your Arrow", "artist": "Kacey Musgraves", "genre": "COUNTRY", "rating": 4, "favorite": False},
        ]
    },
    {
        "username": "riley_electronic",
        "email": "riley@test.com",
        "password": "test123",
        "bio": "Electronic and dance music",
        "genres": ["ELECTRONIC", "DANCE", "EDM"],
        "artists": ["Daft Punk", "The Chainsmokers", "Calvin Harris", "Avicii", "Skrillex"],
        "songs": [
            {"title": "One More Time", "artist": "Daft Punk", "genre": "ELECTRONIC", "rating": 5, "favorite": True},
            {"title": "Closer", "artist": "The Chainsmokers", "genre": "EDM", "rating": 5, "favorite": True},
            {"title": "Levitating", "artist": "Dua Lipa", "genre": "POP", "rating": 4, "favorite": False},
            {"title": "Wake Me Up", "artist": "Avicii", "genre": "EDM", "rating": 4, "favorite": False},
            {"title": "Bangarang", "artist": "Skrillex", "genre": "EDM", "rating": 3, "favorite": False},
        ]
    },
    {
        "username": "casey_jazz",
        "email": "casey@test.com",
        "password": "test123",
        "bio": "Jazz and blues aficionado",
        "genres": ["JAZZ", "BLUES", "SOUL"],
        "artists": ["Norah Jones", "John Coltrane", "Billie Holiday", "Etta James", "Ray Charles"],
        "songs": [
            {"title": "Don't Know Why", "artist": "Norah Jones", "genre": "JAZZ", "rating": 5, "favorite": True},
            {"title": "Giant Steps", "artist": "John Coltrane", "genre": "JAZZ", "rating": 5, "favorite": True},
            {"title": "At Last", "artist": "Etta James", "genre": "BLUES", "rating": 4, "favorite": False},
            {"title": "Georgia on My Mind", "artist": "Ray Charles", "genre": "SOUL", "rating": 4, "favorite": False},
        ]
    },
    {
        "username": "taylor_mixed",
        "email": "taylor@test.com",
        "password": "test123",
        "bio": "I love all kinds of music!",
        "genres": ["POP", "INDIE", "R&B", "ROCK"],
        "artists": ["Taylor Swift", "The Weeknd", "Harry Styles", "Arctic Monkeys", "SZA"],
        "songs": [
            {"title": "Anti-Hero", "artist": "Taylor Swift", "genre": "POP", "rating": 5, "favorite": True},
            {"title": "Blinding Lights", "artist": "The Weeknd", "genre": "R&B", "rating": 5, "favorite": True},
            {"title": "As It Was", "artist": "Harry Styles", "genre": "POP", "rating": 5, "favorite": True},
            {"title": "Starboy", "artist": "The Weeknd", "genre": "R&B", "rating": 4, "favorite": False},
            {"title": "Do I Wanna Know?", "artist": "Arctic Monkeys", "genre": "INDIE", "rating": 4, "favorite": False},
            {"title": "Kill Bill", "artist": "SZA", "genre": "R&B", "rating": 4, "favorite": False},
            {"title": "Shape of You", "artist": "Ed Sheeran", "genre": "POP", "rating": 3, "favorite": False},
        ]
    },
    {
        "username": "morgan_rock",
        "email": "morgan@test.com",
        "password": "test123",
        "bio": "Rock and metal head",
        "genres": ["ROCK", "METAL", "ALTERNATIVE"],
        "artists": ["Led Zeppelin", "AC/DC", "Nirvana", "Foo Fighters", "Metallica"],
        "songs": [
            {"title": "Stairway to Heaven", "artist": "Led Zeppelin", "genre": "ROCK", "rating": 5, "favorite": True},
            {"title": "Smells Like Teen Spirit", "artist": "Nirvana", "genre": "ROCK", "rating": 5, "favorite": True},
            {"title": "Thunderstruck", "artist": "AC/DC", "genre": "ROCK", "rating": 4, "favorite": False},
            {"title": "Everlong", "artist": "Foo Fighters", "genre": "ROCK", "rating": 4, "favorite": False},
        ]
    },
]

# Connections to create (for network visualization)
CONNECTIONS = [
    ("alex_pop", "taylor_mixed"),  # Both like pop
    ("maya_hiphop", "taylor_mixed"),  # Both like R&B
    ("sam_indie", "taylor_mixed"),  # Both like indie
    ("alex_pop", "jordan_country"),  # Both like Taylor Swift
    ("riley_electronic", "alex_pop"),  # Both like pop/dance
]


def create_test_users(db: Session):
    """Create test users with their songs"""
    created_users = {}
    
    print("Creating test users...")
    for user_data in TEST_USERS:
        # Check if user already exists
        existing_user = db.query(User).filter(User.username == user_data["username"]).first()
        if existing_user:
            print(f"  User '{user_data['username']}' already exists, skipping...")
            created_users[user_data["username"]] = existing_user
            continue
        
        # Create user
        user = User(
            username=user_data["username"],
            email=user_data["email"],
            hashed_password=get_password_hash(user_data["password"]),
            bio=user_data.get("bio", ""),
            top_genres=user_data.get("genres", []),
            favorite_artists=user_data.get("artists", [])
        )
        db.add(user)
        db.flush()  # Get user ID
        
        # Add songs
        for song_data in user_data.get("songs", []):
            song = Song(
                user_id=user.id,
                title=song_data["title"],
                artist=song_data["artist"],
                genre=song_data.get("genre"),
                user_rating=song_data.get("rating"),
                is_favorite=song_data.get("favorite", False)
            )
            db.add(song)
        
        created_users[user_data["username"]] = user
        print(f"  ✓ Created user '{user_data['username']}' with {len(user_data.get('songs', []))} songs")
    
    db.commit()
    return created_users


def create_connections(db: Session, users: dict):
    """Create connections between users for network visualization"""
    print("\nCreating connections...")
    
    for username1, username2 in CONNECTIONS:
        user1 = users.get(username1)
        user2 = users.get(username2)
        
        if not user1 or not user2:
            print(f"  ⚠ Skipping connection {username1} -> {username2} (user not found)")
            continue
        
        # Check if connection already exists
        existing = db.query(Connection).filter(
            Connection.user_id == user1.id,
            Connection.connected_user_id == user2.id
        ).first()
        
        if existing:
            print(f"  Connection {username1} -> {username2} already exists, skipping...")
            continue
        
        # Create connection (some accepted, some pending)
        status = ConnectionStatus.ACCEPTED if random.random() > 0.3 else ConnectionStatus.PENDING
        
        connection = Connection(
            user_id=user1.id,
            connected_user_id=user2.id,
            status=status
        )
        db.add(connection)
        print(f"  ✓ Created connection {username1} -> {username2} ({status.value})")
    
    db.commit()


def main():
    """Main function to create test data"""
    db = SessionLocal()
    
    try:
        print("=" * 60)
        print("Creating Test Users for Recommendation Algorithm Testing")
        print("=" * 60)
        
        # Create users
        users = create_test_users(db)
        
        # Create connections
        create_connections(db, users)
        
        print("\n" + "=" * 60)
        print("✓ Test data creation complete!")
        print("=" * 60)
        print(f"\nCreated {len(users)} test users")
        print(f"Created {len(CONNECTIONS)} connections")
        print("\nTest user credentials (all passwords: 'test123'):")
        for username in users.keys():
            print(f"  - {username}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
