# In Tune - Frontend

React frontend framework for the In Tune music-based friend-making platform.

## Tech Stack

- **React 18**: UI library
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **Axios**: HTTP client (for API calls)

## Setup

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   └── Sidebar.css
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Feed.jsx
│   │   ├── Profile.jsx
│   │   ├── Login.jsx
│   │   └── *.css
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

## Pages

- **Login**: Authentication page with register/login forms
- **Dashboard**: Main page with network graph, search, profile cards, and top songs
- **Feed**: Activity feed and notification center
- **Profile**: User profile with songs, artists, genres, albums, and connection statistics

## Development Notes

- This is a framework structure - API integration needs to be implemented
- Components are set up but not fully functional
- Styling is basic and can be enhanced
- Network graph visualization needs to be implemented (consider using D3.js or vis.js)
