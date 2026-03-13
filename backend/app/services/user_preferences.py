"""
Service to update user music preferences (genres, artists) from songs
"""
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.song import Song


def update_user_preferences_from_songs(user: User, db: Session):
    """
    Update user's top_genres and favorite_artists based on their songs
    
    Args:
        user: User object to update
        db: Database session
    """
    # Get all songs for this user
    songs = db.query(Song).filter(Song.user_id == user.id).all()
    
    # Collect unique genres and artists
    genres_set = set()
    artists_set = set()
    
    for song in songs:
        # Add genre if it exists
        if song.genre:
            genres_set.add(song.genre.strip())
        
        # Add artist if it exists
        if song.artist:
            artists_set.add(song.artist.strip())
    
    # Update user's preferences
    # Convert sets to sorted lists for consistency
    user.top_genres = sorted(list(genres_set))
    user.favorite_artists = sorted(list(artists_set))
    
    db.commit()


def add_genre_to_user(user: User, genre: str, db: Session):
    """
    Add a genre to user's top_genres if not already present
    
    Args:
        user: User object
        genre: Genre name to add
        db: Database session
    """
    if not genre or not genre.strip():
        return
    
    genre = genre.strip()
    
    # Initialize if None
    if user.top_genres is None:
        user.top_genres = []
    
    # Add if not already present (case-insensitive)
    genre_lower = genre.lower()
    existing_genres_lower = [g.lower() if g else "" for g in user.top_genres]
    
    if genre_lower not in existing_genres_lower:
        user.top_genres.append(genre)
        user.top_genres = sorted(user.top_genres)
        db.commit()


def add_artist_to_user(user: User, artist: str, db: Session):
    """
    Add an artist to user's favorite_artists if not already present
    
    Args:
        user: User object
        artist: Artist name to add
        db: Database session
    """
    if not artist or not artist.strip():
        return
    
    artist = artist.strip()
    
    # Initialize if None
    if user.favorite_artists is None:
        user.favorite_artists = []
    
    # Add if not already present (case-insensitive)
    artist_lower = artist.lower()
    existing_artists_lower = [a.lower() if a else "" for a in user.favorite_artists]
    
    if artist_lower not in existing_artists_lower:
        user.favorite_artists.append(artist)
        user.favorite_artists = sorted(user.favorite_artists)
        db.commit()
