"""
Similarity calculation service for matching users based on music taste
"""
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.song import Song


def calculate_similarity_score(user1: User, user2: User, db: Session) -> float:
    """
    Calculate similarity score between two users based on:
    - Common genres
    - Common artists
    - Common songs
    - Song ratings overlap
    """
    # Get songs for both users
    user1_songs = db.query(Song).filter(Song.user_id == user1.id).all()
    user2_songs = db.query(Song).filter(Song.user_id == user2.id).all()
    
    # Extract genres, artists, and songs
    user1_genres = set(user1.top_genres or [])
    user2_genres = set(user2.top_genres or [])
    
    user1_artists = set(user1.favorite_artists or [])
    user2_artists = set(user2.favorite_artists or [])
    
    # Get song titles and artists from user songs
    user1_song_set = {(song.title.lower(), song.artist.lower()) for song in user1_songs}
    user2_song_set = {(song.title.lower(), song.artist.lower()) for song in user2_songs}
    
    # Calculate overlaps
    common_genres = user1_genres & user2_genres
    common_artists = user1_artists & user2_artists
    common_songs = user1_song_set & user2_song_set
    
    # Calculate similarity components
    genre_similarity = len(common_genres) / max(len(user1_genres | user2_genres), 1)
    artist_similarity = len(common_artists) / max(len(user1_artists | user2_artists), 1)
    song_similarity = len(common_songs) / max(len(user1_song_set | user2_song_set), 1)
    
    # Weighted average (you can adjust weights)
    similarity_score = (
        genre_similarity * 0.3 +
        artist_similarity * 0.4 +
        song_similarity * 0.3
    )
    
    return round(similarity_score, 2)
