"""
Seed script: creates test users with songs so you can see how the graph looks.
Run from the backend folder while the server is running:
    python seed_test_users.py

Set YOUR_USERNAME to your own account username so the shared songs are matched.
"""

import requests

BASE = "http://localhost:8000"
YOUR_USERNAME = "your_username_here"   # <-- change to your username

TEST_USERS = [
    {
        "username": "alex_beats",
        "email": "alex@test.com",
        "password": "password123",
        "songs": [
            {"title": "Blinding Lights", "artist": "The Weeknd", "genre": "Pop"},
            {"title": "Save Your Tears", "artist": "The Weeknd", "genre": "Pop"},
            {"title": "Starboy", "artist": "The Weeknd", "genre": "RnB"},
        ],
    },
    {
        "username": "luna_vibes",
        "email": "luna@test.com",
        "password": "password123",
        "songs": [
            {"title": "Anti-Hero", "artist": "Taylor Swift", "genre": "Pop"},
            {"title": "Cruel Summer", "artist": "Taylor Swift", "genre": "Pop"},
            {"title": "Lover", "artist": "Taylor Swift", "genre": "Pop"},
        ],
    },
    {
        "username": "marco_sound",
        "email": "marco@test.com",
        "password": "password123",
        "songs": [
            {"title": "HUMBLE.", "artist": "Kendrick Lamar", "genre": "Hip-Hop"},
            {"title": "DNA.", "artist": "Kendrick Lamar", "genre": "Hip-Hop"},
            {"title": "Money Trees", "artist": "Kendrick Lamar", "genre": "Hip-Hop"},
        ],
    },
    {
        "username": "zoe_indie",
        "email": "zoe@test.com",
        "password": "password123",
        "songs": [
            {"title": "Electric Feel", "artist": "MGMT", "genre": "Indie"},
            {"title": "Kids", "artist": "MGMT", "genre": "Indie"},
            {"title": "Do I Wanna Know?", "artist": "Arctic Monkeys", "genre": "Indie Rock"},
        ],
    },
    {
        "username": "kai_deep",
        "email": "kai@test.com",
        "password": "password123",
        "songs": [
            {"title": "One More Time", "artist": "Daft Punk", "genre": "Electronic"},
            {"title": "Get Lucky", "artist": "Daft Punk", "genre": "Electronic"},
            {"title": "Around the World", "artist": "Daft Punk", "genre": "Electronic"},
        ],
    },
    {
        "username": "river_waves",
        "email": "river@test.com",
        "password": "password123",
        "songs": [
            {"title": "Redbone", "artist": "Childish Gambino", "genre": "RnB"},
            {"title": "Feels Like Summer", "artist": "Childish Gambino", "genre": "RnB"},
            {"title": "3005", "artist": "Childish Gambino", "genre": "Hip-Hop"},
        ],
    },
    {
        "username": "nova_rock",
        "email": "nova@test.com",
        "password": "password123",
        "songs": [
            {"title": "Bohemian Rhapsody", "artist": "Queen", "genre": "Rock"},
            {"title": "Under Pressure", "artist": "Queen", "genre": "Rock"},
            {"title": "Somebody to Love", "artist": "Queen", "genre": "Rock"},
        ],
    },
    {
        "username": "pixel_audio",
        "email": "pixel@test.com",
        "password": "password123",
        "songs": [
            {"title": "Levitating", "artist": "Dua Lipa", "genre": "Pop"},
            {"title": "Blinding Lights", "artist": "The Weeknd", "genre": "Pop"},
            {"title": "Peaches", "artist": "Justin Bieber", "genre": "Pop"},
        ],
    },
]


def register_and_seed(user_data):
    username = user_data["username"]

    # Register
    r = requests.post(f"{BASE}/api/auth/register", json={
        "username": username,
        "email": user_data["email"],
        "password": user_data["password"],
    })
    if r.status_code not in (200, 201):
        print(f"  [{username}] register failed: {r.status_code} {r.text[:80]}")
        return False

    # Login to get token
    r = requests.post(f"{BASE}/api/auth/login", data={
        "username": username,
        "password": user_data["password"],
    })
    if r.status_code != 200:
        print(f"  [{username}] login failed: {r.status_code}")
        return False

    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Add songs
    for song in user_data["songs"]:
        r = requests.post(f"{BASE}/api/songs/", json=song, headers=headers)
        if r.status_code not in (200, 201):
            print(f"  [{username}] add song '{song['title']}' failed: {r.status_code}")

    print(f"  [{username}] created with {len(user_data['songs'])} songs")
    return True


if __name__ == "__main__":
    print(f"Seeding {len(TEST_USERS)} test users against {BASE}...")
    print()
    ok = 0
    for u in TEST_USERS:
        if register_and_seed(u):
            ok += 1
    print()
    print(f"Done: {ok}/{len(TEST_USERS)} users created.")
    print()
    print("TIP: Log in as your account and add a few of the same songs")
    print("     (e.g. 'Blinding Lights' by The Weeknd) to see green nodes on the graph.")
    print(f"     Set YOUR_USERNAME = '{YOUR_USERNAME}' at the top of this script if you want")
    print("     to auto-match songs in a future version.")
