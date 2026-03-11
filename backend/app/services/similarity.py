"""
Similarity calculation service for matching users based on music taste
"""
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.song import Song


def calculate_similarity_score(user1: User, user2: User, db: Session) -> float:
    """
    Calculate comprehensive similarity score between two users based on:
    - Common genres (Jaccard similarity)
    - Common artists (Jaccard similarity)
    - Common songs (Jaccard similarity)
    - Favorite songs overlap (weighted higher)
    - Genre frequency (how often genres appear in songs)
    
    Returns a score between 0.0 and 1.0
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
    
    # Get favorite songs (weighted higher)
    user1_favorites = {
        (song.title.lower(), song.artist.lower())
        for song in user1_songs if song.is_favorite
    }
    user2_favorites = {
        (song.title.lower(), song.artist.lower())
        for song in user2_songs if song.is_favorite
    }
    
    # Extract genres from songs (more accurate than just top_genres)
    user1_song_genres = {song.genre.lower() for song in user1_songs if song.genre}
    user2_song_genres = {song.genre.lower() for song in user2_songs if song.genre}
    
    # Calculate overlaps using Jaccard similarity
    # Jaccard = intersection / union
    common_genres = user1_genres & user2_genres
    union_genres = user1_genres | user2_genres
    genre_similarity = len(common_genres) / max(len(union_genres), 1)
    
    # Also consider genres from actual songs
    common_song_genres = user1_song_genres & user2_song_genres
    union_song_genres = user1_song_genres | user2_song_genres
    song_genre_similarity = len(common_song_genres) / max(len(union_song_genres), 1) if union_song_genres else 0
    
    common_artists = user1_artists & user2_artists
    union_artists = user1_artists | user2_artists
    artist_similarity = len(common_artists) / max(len(union_artists), 1)
    
    common_songs = user1_song_set & user2_song_set
    union_songs = user1_song_set | user2_song_set
    song_similarity = len(common_songs) / max(len(union_songs), 1)
    
    # Favorite songs similarity (weighted higher)
    common_favorites = user1_favorites & user2_favorites
    union_favorites = user1_favorites | user2_favorites
    favorite_similarity = len(common_favorites) / max(len(union_favorites), 1) if union_favorites else 0
    
    # Weighted average with improved weights
    # Genres from songs are more accurate than top_genres list
    similarity_score = (
        genre_similarity * 0.15 +           # Top genres list
        song_genre_similarity * 0.25 +      # Genres from actual songs (more accurate)
        artist_similarity * 0.30 +           # Artists (strong indicator)
        song_similarity * 0.20 +             # All songs
        favorite_similarity * 0.10           # Favorite songs (bonus)
    )
    
    return round(similarity_score, 3)
