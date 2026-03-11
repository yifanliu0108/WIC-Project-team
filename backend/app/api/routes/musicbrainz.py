"""
MusicBrainz proxy routes to avoid CORS issues and centralize search logic.
"""
from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter()

MB_BASE = "https://musicbrainz.org/ws/2"
HEADERS = {"User-Agent": "InTuneApp/1.0 (dev@intune.local)"}


@router.get("/search/artist")
async def search_artist(name: str):
    params = {"query": name, "fmt": "json", "limit": 10}
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{MB_BASE}/artist/", params=params, headers=HEADERS)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail="MusicBrainz error")
    return resp.json()


@router.get("/search/song")
async def search_song(title: str, artist: str | None = None):
    query = title
    if artist:
        query += f" AND artist:{artist}"
    params = {"query": query, "fmt": "json", "limit": 10}
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{MB_BASE}/recording/", params=params, headers=HEADERS)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail="MusicBrainz error")
    return resp.json()


@router.get("/song/{mbid}")
async def get_song_details(mbid: str):
    params = {"fmt": "json", "inc": "artists+releases"}
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{MB_BASE}/recording/{mbid}", params=params, headers=HEADERS)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail="MusicBrainz error")
    return resp.json()


@router.get("/lookup")
async def lookup_song(title: str, artist: str | None = None):
    # simple wrapper reusing search_song
    return await search_song(title, artist)
