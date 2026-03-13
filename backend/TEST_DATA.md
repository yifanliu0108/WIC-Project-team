# Test Data Generation

This guide explains how to create test users for testing the recommendation algorithm and network visualization.

## Quick Start

1. **Activate your virtual environment:**
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Run the test data generation script:**
   ```bash
   python scripts/create_test_users.py
   ```

3. **That's it!** The script will create 8 test users with varied music preferences, songs, and connections.

## What Gets Created

### Test Users

The script creates 8 users with different music tastes:

| Username | Music Preference | Genres | Key Artists |
|----------|-----------------|--------|-------------|
| `alex_pop` | Pop & Rock | POP, ROCK, INDIE | Taylor Swift, The Weeknd, Harry Styles |
| `maya_hiphop` | Hip-Hop & R&B | HIP-HOP, R&B, RAP | Drake, Kendrick Lamar, The Weeknd |
| `sam_indie` | Indie & Alternative | INDIE, ALTERNATIVE, ROCK | Arctic Monkeys, Tame Impala |
| `jordan_country` | Country | COUNTRY, FOLK | Luke Combs, Morgan Wallen |
| `riley_electronic` | Electronic & Dance | ELECTRONIC, DANCE, EDM | Daft Punk, The Chainsmokers |
| `casey_jazz` | Jazz & Blues | JAZZ, BLUES, SOUL | Norah Jones, John Coltrane |
| `taylor_mixed` | Mixed Taste | POP, INDIE, R&B, ROCK | Taylor Swift, The Weeknd, Arctic Monkeys |
| `morgan_rock` | Rock & Metal | ROCK, METAL | Led Zeppelin, Nirvana |

### Songs

Each user has 4-8 songs with:
- **Ratings** (1-5 stars)
- **Favorite flags** (some songs marked as favorites)
- **Genres** (matching user preferences)
- **Overlapping songs** between users (to test similarity algorithm)

### Connections

The script creates connections between users for network visualization:
- `alex_pop` ↔ `taylor_mixed` (both like pop)
- `maya_hiphop` ↔ `taylor_mixed` (both like R&B)
- `sam_indie` ↔ `taylor_mixed` (both like indie)
- `alex_pop` ↔ `jordan_country` (both like Taylor Swift)
- `riley_electronic` ↔ `alex_pop` (both like pop/dance)

## Testing Recommendations

After creating test users, you can:

1. **Log in as any test user** (password: `test123`)
2. **View recommendations** on the Dashboard or Feed page
3. **See network visualization** showing connections
4. **Test similarity scores** - users with overlapping songs/artists should have higher similarity

### Example Test Scenarios

- **Log in as `taylor_mixed`**: Should see recommendations for users with similar mixed tastes
- **Log in as `alex_pop`**: Should see `maya_hiphop` (both like The Weeknd) and `jordan_country` (both like Taylor Swift)
- **Log in as `sam_indie`**: Should see `taylor_mixed` (both like indie) but not `casey_jazz` (very different tastes)

## Resetting Test Data

To start fresh, you can:

1. **Delete the database** (if using SQLite):
   ```bash
   rm backend/intune.db
   ```

2. **Reinitialize the database**:
   ```bash
   python init_db.py
   ```

3. **Re-run the test data script**:
   ```bash
   python scripts/create_test_users.py
   ```

## Notes

- The script is **idempotent** - safe to run multiple times (skips existing users)
- All test users have the same password: `test123`
- Songs are intentionally overlapping to test the recommendation algorithm
- Some connections are marked as "pending" to test connection request features
