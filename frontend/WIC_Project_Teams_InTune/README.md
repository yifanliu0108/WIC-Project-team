# intune — Login Page (Static)

Simple static prototype of a login page for a music-taste social matching app.

To open locally, double-click `index.html` or serve with a static server.

Example using Python 3 built-in server:

```bash
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

Next steps:
- Wire form submit to your backend authentication endpoint
- Implement Spotify/Apple Music OAuth server-side flow
- Add accessibility and tests

Notes about the username field
- The front-end now uses `username` (field `name="username"`, `type="text"). If your backend expects `email`, either update the API to accept `username` or map the `username` value to `email` when submitting.
