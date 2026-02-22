# Swagger UI Testing Guide

Swagger UI is an interactive API documentation tool that FastAPI automatically generates. It lets you test your backend endpoints directly in the browser.

## Accessing Swagger UI

1. Start your backend server:
   ```bash
   cd backend
   python run.py
   ```

2. Open in browser:
   ```
   http://localhost:8000/docs
   ```

## How to Use Swagger UI

### 1. Understanding the Interface

- **Green "GET", "POST", etc.** = HTTP method
- **Endpoint path** = The URL route (e.g., `/api/auth/register`)
- **Description** = What the endpoint does
- **Try it out** button = Click to test the endpoint

### 2. Testing Registration

**Step 1:** Find `POST /api/auth/register`
- Click on it to expand
- Click **"Try it out"** button

**Step 2:** Fill in the request body
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "test123"
}
```

**Step 3:** Click **"Execute"**

**Step 4:** Check the response
- **Response Code:** Should be `201` (Created)
- **Response Body:** Should show the created user (without password)

### 3. Testing Login

**Step 1:** Find `POST /api/auth/login`
- Click **"Try it out"**

**Step 2:** Fill in form data
- `username`: `testuser`
- `password`: `test123`

**Step 3:** Click **"Execute"**

**Step 4:** Copy the `access_token` from response
- You'll need this for authenticated endpoints

### 4. Testing Authenticated Endpoints

**Step 1:** Authorize with token
- Click the **"Authorize"** button (top right, lock icon)
- In the "Value" field, paste your token: `Bearer YOUR_TOKEN_HERE`
- Click **"Authorize"**, then **"Close"**

**Step 2:** Test protected endpoint
- Find `GET /api/auth/me`
- Click **"Try it out"** → **"Execute"**
- Should return your user info

### 5. Testing Song Endpoints

**Add a song:**
1. Find `POST /api/songs/`
2. Click **"Try it out"**
3. Fill in:
   ```json
   {
     "title": "Bohemian Rhapsody",
     "artist": "Queen",
     "genre": "Rock",
     "is_favorite": true
   }
   ```
4. Click **"Execute"**

**Get your songs:**
1. Find `GET /api/songs/me`
2. Click **"Try it out"** → **"Execute"**
3. Should return list of your songs

### 6. Testing MusicBrainz Integration

**Search for artist:**
1. Find `GET /api/musicbrainz/search/artist`
2. Click **"Try it out"**
3. Enter `name`: `Queen`
4. Click **"Execute"**
5. See artist results from MusicBrainz

**Search for song:**
1. Find `GET /api/musicbrainz/search/song`
2. Click **"Try it out"**
3. Enter `title`: `Bohemian Rhapsody`
4. Enter `artist`: `Queen` (optional)
5. Click **"Execute"**

## Tips

1. **Always authorize first** for protected endpoints
2. **Check response codes:**
   - `200` = Success
   - `201` = Created
   - `400` = Bad request (check your input)
   - `401` = Unauthorized (need to login/authorize)
   - `404` = Not found

3. **Read error messages** - They tell you what's wrong

4. **Use the schema** - Click "Schema" to see what fields are required

5. **Test in order:**
   - Register → Login → Get token → Test protected endpoints

## Common Issues

**"401 Unauthorized"**
- You need to login first and authorize with token

**"422 Validation Error"**
- Check required fields are filled
- Check data types (string, number, etc.)

**"500 Internal Server Error"**
- Check backend logs for error details
- Usually a bug in your code

## Alternative: ReDoc

FastAPI also provides ReDoc (alternative documentation):
```
http://localhost:8000/redoc
```

ReDoc is read-only (can't test endpoints), but has better formatting for reading documentation.
