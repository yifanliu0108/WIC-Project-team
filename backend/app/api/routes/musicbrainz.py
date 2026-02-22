"""
MusicBrainz API routes for song/artist lookup
"""
from fastapi import APIRouter, Query, HTTPException, status
from typing import Optional, List
from app.services.musicbrainz import (
    search_artist,
    search_recording,
    get_recording_details,
    lookup_song_info
)

router = APIRouter()


@router.get("/search/artist")
async def search_artist_endpoint(
    name: str = Query(..., description="Artist name to search for"),
    limit: int = Query(5, ge=1, le=25, description="Maximum number of results")
):
    """Search for artists by name"""
    results = search_artist(name, limit)
    return {"artists": results}


@router.get("/search/song")
async def search_song_endpoint(
    title: str = Query(..., description="Song title to search for"),
    artist: Optional[str] = Query(None, description="Optional artist name to narrow search"),
    limit: int = Query(5, ge=1, le=25, description="Maximum number of results")
):
    """Search for songs by title and optionally artist"""
    results = search_recording(title, artist, limit)
    return {"songs": results}


@router.get("/song/{mbid}")
async def get_song_details(mbid: str):
    """Get detailed information about a song by MusicBrainz ID"""
    details = get_recording_details(mbid)
    if not details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )
    return details


@router.get("/lookup")
async def lookup_song(
    title: str = Query(..., description="Song title"),
    artist: Optional[str] = Query(None, description="Optional artist name")
):
    """Quick lookup for a song - returns best match"""
    result = lookup_song_info(title, artist)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )
    return result
