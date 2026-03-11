"""
Advanced recommendation algorithm for matching users based on music taste
"""
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from app.models.user import User
from app.models.song import Song
from app.models.connection import Connection, ConnectionStatus
from app.services.similarity import calculate_similarity_score


def get_user_recommendations(
    current_user: User,
    db: Session,
    limit: int = 10,
    min_similarity: float = 0.1,
    exclude_connected: bool = True,
    diversity_factor: float = 0.2
) -> List[Dict]:
    """
    Get personalized user recommendations with advanced algorithm
    
    Algorithm considers:
    1. Music taste similarity (genres, artists, songs)
    2. Rating patterns (how users rate similar songs)
    3. Activity level (users with more songs get slight boost)
    4. Diversity (ensures variety in recommendations)
    5. Excludes existing connections
    
    Args:
        current_user: The user to get recommendations for
        db: Database session
        limit: Maximum number of recommendations
        min_similarity: Minimum similarity score threshold
        exclude_connected: Whether to exclude users with existing connections
        diversity_factor: How much to prioritize diversity (0-1)
    
    Returns:
        List of recommendation dictionaries with user info and similarity details
    """
    # Get all other users
    query = db.query(User).filter(User.id != current_user.id)
    
    # Exclude users with existing connections if requested
    if exclude_connected:
        existing_connection_user_ids = db.query(Connection.connected_user_id).filter(
            Connection.user_id == current_user.id
        ).union(
            db.query(Connection.user_id).filter(
                Connection.connected_user_id == current_user.id
            )
        ).all()
        existing_ids = [row[0] for row in existing_connection_user_ids]
        if existing_ids:
            query = query.filter(~User.id.in_(existing_ids))
    
    all_users = query.all()
    
    # Get current user's songs for analysis
    current_user_songs = db.query(Song).filter(Song.user_id == current_user.id).all()
    current_user_song_count = len(current_user_songs)
    
    recommendations = []
    
    for user in all_users:
        # Calculate base similarity score
        similarity_score = calculate_similarity_score(current_user, user, db)
        
        if similarity_score < min_similarity:
            continue
        
        # Get user's songs for additional analysis
        user_songs = db.query(Song).filter(Song.user_id == user.id).all()
        user_song_count = len(user_songs)
        
        # Calculate additional factors
        
        # 1. Rating similarity (if both users have rated songs)
        rating_similarity = _calculate_rating_similarity(
            current_user_songs, user_songs, db
        )
        
        # 2. Activity level bonus (users with more songs are more engaged)
        activity_bonus = min(user_song_count / 20.0, 0.1)  # Max 10% bonus
        
        # 3. Genre diversity score (prefer users with some different genres too)
        diversity_score = _calculate_diversity_score(
            current_user.top_genres or [],
            user.top_genres or []
        )
        
        # Combine scores
        final_score = (
            similarity_score * (1 - diversity_factor) +
            rating_similarity * 0.15 +
            activity_bonus * 0.05 +
            diversity_score * diversity_factor
        )
        
        # Get common items for display
        common_genres = set(current_user.top_genres or []) & set(user.top_genres or [])
        common_artists = set(current_user.favorite_artists or []) & set(user.favorite_artists or [])
        
        # Get user's top songs
        top_songs = db.query(Song).filter(
            Song.user_id == user.id,
            Song.is_favorite == True
        ).order_by(
            Song.user_rating.desc().nulls_last()
        ).limit(3).all()
        
        recommendations.append({
            "user_id": user.id,
            "username": user.username,
            "similarity_score": round(similarity_score, 3),
            "final_score": round(final_score, 3),
            "common_genres": list(common_genres),
            "common_artists": list(common_artists),
            "user_song_count": user_song_count,
            "rating_similarity": round(rating_similarity, 3),
            "top_songs": [
                {
                    "id": song.id,
                    "title": song.title,
                    "artist": song.artist,
                    "genre": song.genre,
                    "rating": song.user_rating
                }
                for song in top_songs
            ]
        })
    
    # Sort by final score (descending)
    recommendations.sort(key=lambda x: x["final_score"], reverse=True)
    
    return recommendations[:limit]


def _calculate_rating_similarity(
    user1_songs: List[Song],
    user2_songs: List[Song],
    db: Session
) -> float:
    """
    Calculate similarity based on how users rate similar songs
    If both users rated the same song, compare their ratings
    """
    if not user1_songs or not user2_songs:
        return 0.0
    
    # Create normalized song identifiers
    user1_song_map = {
        (song.title.lower(), song.artist.lower()): song.user_rating
        for song in user1_songs if song.user_rating is not None
    }
    user2_song_map = {
        (song.title.lower(), song.artist.lower()): song.user_rating
        for song in user2_songs if song.user_rating is not None
    }
    
    # Find songs both users rated
    common_rated_songs = set(user1_song_map.keys()) & set(user2_song_map.keys())
    
    if not common_rated_songs:
        return 0.0
    
    # Calculate average rating difference (lower difference = higher similarity)
    rating_differences = []
    for song_key in common_rated_songs:
        rating1 = user1_song_map[song_key]
        rating2 = user2_song_map[song_key]
        diff = abs(rating1 - rating2)
        rating_differences.append(diff)
    
    avg_difference = sum(rating_differences) / len(rating_differences)
    
    # Convert to similarity score (0-1, where 0 difference = 1.0 similarity)
    # Max difference is 4 (1 vs 5), so normalize
    similarity = 1.0 - (avg_difference / 4.0)
    return max(0.0, similarity)


def _calculate_diversity_score(
    user1_genres: List[str],
    user2_genres: List[str]
) -> float:
    """
    Calculate diversity score - balance between similarity and exploration
    Higher score means some overlap but also some unique genres
    """
    if not user1_genres or not user2_genres:
        return 0.0
    
    user1_genres_set = set(user1_genres)
    user2_genres_set = set(user2_genres)
    
    common = user1_genres_set & user2_genres_set
    unique_to_user2 = user2_genres_set - user1_genres_set
    
    # Score based on having both common and unique genres
    if not common:
        return 0.0  # No overlap = no diversity score
    
    # Balance: some common genres + some new genres to explore
    common_ratio = len(common) / max(len(user1_genres_set | user2_genres_set), 1)
    unique_ratio = len(unique_to_user2) / max(len(user2_genres_set), 1)
    
    # Diversity score encourages exploration while maintaining similarity
    diversity = (common_ratio * 0.6) + (unique_ratio * 0.4)
    return min(1.0, diversity)


def get_song_recommendations(
    current_user: User,
    db: Session,
    limit: int = 10,
    from_connections: bool = True
) -> List[Dict]:
    """
    Recommend songs to user based on:
    1. Songs liked by users with similar taste
    2. Songs from connected users
    3. Popular songs in user's favorite genres
    """
    recommendations = []
    
    # Get songs from connected users
    if from_connections:
        connections = db.query(Connection).filter(
            ((Connection.user_id == current_user.id) | 
             (Connection.connected_user_id == current_user.id)),
            Connection.status == ConnectionStatus.ACCEPTED
        ).all()
        
        connected_user_ids = []
        for conn in connections:
            if conn.user_id == current_user.id:
                connected_user_ids.append(conn.connected_user_id)
            else:
                connected_user_ids.append(conn.user_id)
        
        if connected_user_ids:
            # Get favorite songs from connected users
            connected_songs = db.query(Song).filter(
                Song.user_id.in_(connected_user_ids),
                Song.is_favorite == True
            ).order_by(Song.user_rating.desc().nulls_last()).limit(limit * 2).all()
            
            # Filter out songs user already has
            current_user_song_set = {
                (song.title.lower(), song.artist.lower())
                for song in db.query(Song).filter(Song.user_id == current_user.id).all()
            }
            
            for song in connected_songs:
                song_key = (song.title.lower(), song.artist.lower())
                if song_key not in current_user_song_set:
                    recommendations.append({
                        "id": song.id,
                        "title": song.title,
                        "artist": song.artist,
                        "genre": song.genre,
                        "album": song.album,
                        "rating": song.user_rating,
                        "source": "connected_user",
                        "user_id": song.user_id
                    })
    
    # Get songs from similar users (not yet connected)
    if len(recommendations) < limit:
        # Get top similar users
        similar_users = get_user_recommendations(
            current_user, db, limit=5, exclude_connected=True
        )
        
        similar_user_ids = [rec["user_id"] for rec in similar_users]
        if similar_user_ids:
            similar_songs = db.query(Song).filter(
                Song.user_id.in_(similar_user_ids),
                Song.is_favorite == True
            ).order_by(Song.user_rating.desc().nulls_last()).limit(limit).all()
            
            current_user_song_set = {
                (song.title.lower(), song.artist.lower())
                for song in db.query(Song).filter(Song.user_id == current_user.id).all()
            }
            
            for song in similar_songs:
                song_key = (song.title.lower(), song.artist.lower())
                if song_key not in current_user_song_set:
                    recommendations.append({
                        "id": song.id,
                        "title": song.title,
                        "artist": song.artist,
                        "genre": song.genre,
                        "album": song.album,
                        "rating": song.user_rating,
                        "source": "similar_user",
                        "user_id": song.user_id
                    })
    
    # Remove duplicates and return
    seen = set()
    unique_recommendations = []
    for rec in recommendations:
        key = (rec["title"].lower(), rec["artist"].lower())
        if key not in seen:
            seen.add(key)
            unique_recommendations.append(rec)
    
    return unique_recommendations[:limit]
