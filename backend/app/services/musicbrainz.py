"""
MusicBrainz API integration service
Used to look up song/artist metadata
"""
import httpx
import time
from typing import Optional, Dict, List
from app.core.config import settings

# MusicBrainz API base URL
MUSICBRAINZ_API_URL = "https://musicbrainz.org/ws/2"
# Rate limit: 1 request per second (be respectful!)
_last_request_time = 0


def _rate_limit():
    """Enforce rate limiting (1 request per second)"""
    global _last_request_time
    current_time = time.time()
    time_since_last = current_time - _last_request_time
    if time_since_last < 1.0:
        time.sleep(1.0 - time_since_last)
    _last_request_time = time.time()


def search_artist(artist_name: str, limit: int = 5) -> List[Dict]:
    """
    Search for an artist by name
    
    Args:
        artist_name: Name of the artist to search for
        limit: Maximum number of results to return
        
    Returns:
        List of artist dictionaries with name, mbid, and other metadata
    """
    _rate_limit()
    
    try:
        url = f"{MUSICBRAINZ_API_URL}/artist"
        params = {
            "query": f'artist:"{artist_name}"',
            "limit": limit,
            "fmt": "json"
        }
        headers = {
            "User-Agent": "InTune/1.0.0 (https://github.com/yifanliu0108/WIC-Project-team)"
        }
        
        with httpx.Client() as client:
            response = client.get(url, params=params, headers=headers, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            artists = []
            for artist in data.get("artists", []):
                artists.append({
                    "name": artist.get("name"),
                    "mbid": artist.get("id"),
                    "type": artist.get("type"),
                    "disambiguation": artist.get("disambiguation"),
                    "country": artist.get("country")
                })
            return artists
    except Exception as e:
        print(f"Error searching artist: {e}")
        return []


def search_recording(song_title: str, artist_name: Optional[str] = None, limit: int = 5) -> List[Dict]:
    """
    Search for a recording (song) by title and optionally artist
    
    Args:
        song_title: Title of the song
        artist_name: Optional artist name to narrow search
        limit: Maximum number of results to return
        
    Returns:
        List of recording dictionaries with title, artist, mbid, etc.
    """
    _rate_limit()
    
    try:
        url = f"{MUSICBRAINZ_API_URL}/recording"
        query = f'recording:"{song_title}"'
        if artist_name:
            query += f' AND artist:"{artist_name}"'
        
        params = {
            "query": query,
            "limit": limit,
            "fmt": "json"
        }
        headers = {
            "User-Agent": "InTune/1.0.0 (https://github.com/yifanliu0108/WIC-Project-team)"
        }
        
        with httpx.Client() as client:
            response = client.get(url, params=params, headers=headers, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            recordings = []
            for recording in data.get("recordings", []):
                # Get primary artist
                artist_credit = recording.get("artist-credit", [])
                artist_name_mb = ""
                if artist_credit:
                    artist_name_mb = artist_credit[0].get("name", "")
                
                recordings.append({
                    "title": recording.get("title"),
                    "artist": artist_name_mb,
                    "mbid": recording.get("id"),
                    "length": recording.get("length"),  # in milliseconds
                    "disambiguation": recording.get("disambiguation")
                })
            return recordings
    except Exception as e:
        print(f"Error searching recording: {e}")
        return []


def get_recording_details(mbid: str) -> Optional[Dict]:
    """
    Get detailed information about a recording by MBID
    
    Args:
        mbid: MusicBrainz ID of the recording
        
    Returns:
        Dictionary with detailed recording information
    """
    _rate_limit()
    
    try:
        url = f"{MUSICBRAINZ_API_URL}/recording/{mbid}"
        params = {
            "inc": "artists+releases+tags",
            "fmt": "json"
        }
        headers = {
            "User-Agent": "InTune/1.0.0 (https://github.com/yifanliu0108/WIC-Project-team)"
        }
        
        with httpx.Client() as client:
            response = client.get(url, params=params, headers=headers, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            # Extract genres/tags
            tags = [tag.get("name") for tag in data.get("tags", [])]
            
            # Get releases (albums)
            releases = []
            for release in data.get("releases", []):
                releases.append({
                    "title": release.get("title"),
                    "date": release.get("date"),
                    "country": release.get("country")
                })
            
            return {
                "title": data.get("title"),
                "artist": data.get("artist-credit", [{}])[0].get("name", "") if data.get("artist-credit") else "",
                "mbid": mbid,
                "length": data.get("length"),
                "tags": tags,
                "releases": releases
            }
    except Exception as e:
        print(f"Error getting recording details: {e}")
        return None


def lookup_song_info(song_title: str, artist_name: Optional[str] = None) -> Optional[Dict]:
    """
    Convenience function to look up song information
    Returns the best match with metadata
    
    Args:
        song_title: Title of the song
        artist_name: Optional artist name
        
    Returns:
        Dictionary with song information or None if not found
    """
    recordings = search_recording(song_title, artist_name, limit=1)
    if recordings:
        return recordings[0]
    return None
