# Test Data Generation Scripts

This directory contains scripts for generating test data to test the recommendation algorithm and network visualization.

## create_test_users.py

Creates multiple test users with varied music preferences, songs, and connections for testing.

### Usage

1. Make sure your virtual environment is activated:
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Run the script:
```bash
python scripts/create_test_users.py
```

### What it creates:

- **8 test users** with different music preferences:
  - `alex_pop` - Pop and rock fan
  - `maya_hiphop` - Hip-hop and R&B enthusiast
  - `sam_indie` - Indie and alternative
  - `jordan_country` - Country music lover
  - `riley_electronic` - Electronic and dance
  - `casey_jazz` - Jazz and blues
  - `taylor_mixed` - Mixed taste (good for testing recommendations)
  - `morgan_rock` - Rock and metal

- **Songs** for each user with:
  - Different genres
  - Ratings (1-5)
  - Favorite flags
  - Overlapping songs between users (to test similarity)

- **Connections** between users for network visualization testing

### Test User Credentials

All test users have the password: `test123`

You can log in with any of these usernames:
- alex_pop
- maya_hiphop
- sam_indie
- jordan_country
- riley_electronic
- casey_jazz
- taylor_mixed
- morgan_rock

### Notes

- The script checks if users already exist and skips them (safe to run multiple times)
- Some songs overlap between users intentionally to test the recommendation algorithm
- Connections are created with random status (mostly accepted, some pending)
