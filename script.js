// ===============================
// GLOBALS - Variables used everywhere in the app
// ===============================

// Get references to HTML elements we'll need
const searchInput = document.getElementById('searchInput');
const resultsSection = document.getElementById('search-results-section');
const resultsGrid = document.getElementById('search-results-grid');

// Create a new Audio object for playing songs
const audioPlayer = new Audio();

// Track whether repeat mode is on and the currently playing song
let isRepeating = false;
let currentSong = null;

// URL for our local backend (json-server running on port 3000)
const API_URL = "http://localhost:3000";

// ===============================
// DEEZER API & PLAYER FUNCTIONS
// ===============================

// Called when user clicks search icon or presses Enter
function searchSongs() {
    const query = searchInput.value.trim();
    if (!query) return;  // don't search empty input

    // Show the search results section and display "Searching..."
    resultsSection.style.display = "block";
    resultsGrid.innerHTML = "<p style='padding:20px;'>Searching...</p>";

    // Create a <script> tag that calls Deezer's JSONP API
    // JSONP lets us bypass CORS restrictions by using a callback function
    const script = document.createElement("script");
    script.src = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&output=jsonp&callback=handleSearchResponse`;
    document.body.appendChild(script);
    script.onload = () => script.remove();  // clean up after loading
}

// This function is called automatically by Deezer's JSONP response
window.handleSearchResponse = function (data) {
    if (data && data.data && data.data.length > 0) {
        displayResults(data.data);  // show songs in grid
    } else {
        resultsGrid.innerHTML = "<p style='padding:20px;'>No songs found.</p>";
    }
};

// Search for all songs in a specific album (called when user clicks an album)
function albumSearch(albumTitle, artistName) {
    resultsSection.style.display = "block";
    resultsGrid.innerHTML = "<p style='padding:20px;'>Loading album...</p>";

    // First search for the album to get its ID
    const query = `album:"${albumTitle}" artist:"${artistName}"`;
    const script = document.createElement("script");
    script.src = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&output=jsonp&callback=handleAlbumID`;
    document.body.appendChild(script);
    script.onload = () => script.remove();
}

// After getting album ID, fetch all tracks from that album
window.handleAlbumID = function (data) {
    if (data && data.data && data.data.length > 0) {
        const albumID = data.data[0].album.id;
        const script = document.createElement("script");
        script.src = `https://api.deezer.com/album/${albumID}/tracks?output=jsonp&callback=handleSearchResponse`;
        document.body.appendChild(script);
        script.onload = () => script.remove();
    } else {
        resultsGrid.innerHTML = "<p style='padding:20px;'>Album not found.</p>";
    }
};

// Called when user clicks a trending song (predefined list)
function playTrending(title, artist) {
    const query = `${title} ${artist}`;
    const script = document.createElement("script");
    script.src = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&output=jsonp&callback=handleTrendingPlay`;
    document.body.appendChild(script);
    script.onload = () => script.remove();
}

// Get the preview URL for the trending song and play it
window.handleTrendingPlay = function (data) {
    if (data && data.data && data.data.length > 0) {
        playSong(data.data[0].preview, data.data[0]);
    }
};

// Create HTML cards for each song in search results
function displayResults(songs) {
    resultsGrid.innerHTML = "";
    songs.forEach(song => {
        const card = document.createElement("div");
        card.className = "song-card";
        card.onclick = () => playSong(song.preview, song);  // play when clicked

        // Use escapeHtml to prevent XSS attacks (malicious code in song titles)
        card.innerHTML = `
            <div class="album-wrapper">
                <img src="${song.album?.cover_medium || 'Assets/default.png'}" onerror="this.src='Assets/default.png'">
                <div class="play-overlay">▶</div>
            </div>
            <h4>${escapeHtml(song.title)}</h4>
            <p>${escapeHtml(song.artist.name)}</p>
        `;
        resultsGrid.appendChild(card);
    });
}

// Main function to play a song
function playSong(url, song) {
    if (!url) {
        alert("Preview not available");
        return;
    }
    currentSong = song;  // store for "like" functionality

    // Set audio source and start playing
    audioPlayer.src = url;
    audioPlayer.currentTime = 0;
    audioPlayer.play();

    // Show the player bar at bottom
    const playerBar = document.getElementById("player-bar");
    if (playerBar) playerBar.style.display = "flex";

    // Update player bar with song info
    const img = document.getElementById("p-img");
    const title = document.getElementById("p-title");
    const artist = document.getElementById("p-artist");
    if (img) img.src = song.album?.cover_medium || "Assets/default.png";
    if (title) title.innerText = song.title;
    if (artist) artist.innerText = song.artist.name;

    // Change play button to pause icon
    const btn = document.getElementById("masterPlay");
    if (btn) btn.className = "fa-solid fa-circle-pause";
}

// ===============================
// PLAYER CONTROL EVENT LISTENERS
// ===============================

// Play/Pause button
document.getElementById("masterPlay")?.addEventListener("click", () => {
    const btn = document.getElementById("masterPlay");
    if (audioPlayer.paused) {
        audioPlayer.play();
        btn.className = "fa-solid fa-circle-pause";
    } else {
        audioPlayer.pause();
        btn.className = "fa-solid fa-circle-play";
    }
});

// Volume slider
document.getElementById("volumeSlider")?.addEventListener("input", (e) => {
    audioPlayer.volume = e.target.value / 100;
});

// Repeat button - toggles looping
document.getElementById("repeatBtn")?.addEventListener("click", () => {
    isRepeating = !isRepeating;
    audioPlayer.loop = isRepeating;
    const repeatBtn = document.getElementById("repeatBtn");
    if (repeatBtn) repeatBtn.style.color = isRepeating ? "#1db954" : "#b3b3b3";
});

// Press Enter in search box to trigger search
searchInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchSongs();
});

// ===============================
// HELPER FUNCTIONS
// ===============================

// Called when an artist card is clicked - searches for that artist
function togglePlay(element) {
    const artistName = element.querySelector("p").innerText;
    searchInput.value = artistName;
    searchSongs();
}

// Close the search results section
function closeSearch() {
    resultsSection.style.display = "none";
}

// Placeholder sign-in function
function handleSignIn() {
    alert("Sign In coming soon!");
}

// Scroll to top of page
function scrollToHome() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Scroll to search input
function scrollToSearch() {
    searchInput.scrollIntoView({ behavior: 'smooth' });
}

// Prevent XSS attacks by converting special characters to HTML entities
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ===============================
// CRUD: PLAYLISTS (GET, POST, PATCH, DELETE)
// ===============================

// GET - Fetch all playlists from the server and display them
async function fetchPlaylists() {
    try {
        const res = await fetch(`${API_URL}/playlists`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const playlists = await res.json();
        const container = document.getElementById("playlistsContainer");
        if (!container) return;

        if (playlists.length === 0) {
            container.innerHTML = "<p style='color:#b3b3b3;'>No playlists yet. Click 'Create Playlist' to add one.</p>";
            return;
        }

        // Create HTML for each playlist with Edit and Delete buttons
        container.innerHTML = playlists.map(playlist => `
            <div class="playlist-item" data-id="${playlist.id}">
                <strong>${escapeHtml(playlist.name)}</strong>
                <div>
                    <button class="editPlaylistBtn" data-id="${playlist.id}">✏️ Edit</button>
                    <button class="deletePlaylistBtn" data-id="${playlist.id}">🗑️ Delete</button>
                </div>
            </div>
        `).join("");

        // Attach event listeners to dynamically created buttons
        document.querySelectorAll(".editPlaylistBtn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = parseInt(btn.dataset.id);
                updatePlaylist(id);   // PATCH
            });
        });
        document.querySelectorAll(".deletePlaylistBtn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                if (confirm("Delete this playlist?")) deletePlaylist(parseInt(btn.dataset.id));  // DELETE
            });
        });
    } catch (error) {
        console.error("GET playlists failed:", error);
        const container = document.getElementById("playlistsContainer");
        if (container) container.innerHTML = "<p style='color:red;'>⚠️ Backend not running. Run: json-server --watch db.json --port 3000</p>";
    }
}

// POST - Create a new playlist
async function createPlaylist() {
    const playlistName = prompt("Enter Playlist Name:");
    if (!playlistName) return;

    try {
        const res = await fetch(`${API_URL}/playlists`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: playlistName, songs: [] })  // empty songs array initially
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        alert(`Playlist "${data.name}" created`);
        fetchPlaylists();  // refresh the list
    } catch (error) {
        console.error("POST failed:", error);
        alert("Failed to create playlist. Is json-server running?");
    }
}

// PATCH - Partially update a playlist (only change the name)
async function updatePlaylist(id) {
    const newName = prompt("Enter New Playlist Name:");
    if (!newName) return;

    try {
        const res = await fetch(`${API_URL}/playlists/${id}`, {
            method: "PATCH",   // PATCH allows partial update
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName })  // only send the field we want to change
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        alert("Playlist updated");
        fetchPlaylists();  // refresh
    } catch (error) {
        console.error("PATCH failed:", error);
        alert("Update failed. Is json-server running?");
    }
}

// DELETE - Remove a playlist completely
async function deletePlaylist(id) {
    try {
        const res = await fetch(`${API_URL}/playlists/${id}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Server responded with ${res.status}: ${errorText}`);
        }

        alert("Playlist deleted successfully");
        await fetchPlaylists();  // refresh after successful deletion
    } catch (error) {
        console.error("DELETE failed:", error);
        alert("Delete failed. Make sure json-server is running and the playlist ID exists.");
    }
}

// ===============================
// CRUD: LIKED SONGS (POST, GET)
// ===============================

// POST - Save the currently playing song to likedSongs
async function likeCurrentSong() {
    if (!currentSong) {
        alert("Play a song first");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/likedSongs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(currentSong)  // send the whole song object
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        alert("❤️ Added to Liked Songs");
    } catch (error) {
        console.error("Like failed:", error);
        alert("Failed to like song. Is json-server running?");
    }
}

// GET - Fetch all liked songs and display them
async function fetchLikedSongs() {
    try {
        const res = await fetch(`${API_URL}/likedSongs`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const liked = await res.json();
        const container = document.getElementById("likedSongsContainer");
        if (!container) return;

        if (liked.length === 0) {
            container.innerHTML = "<p style='color:#b3b3b3;'>No liked songs yet. Click the heart icon while playing a song.</p>";
            return;
        }

        // Simple display: each liked song as a row
        container.innerHTML = liked.map((song, idx) => `
            <div class="liked-song-item">
                <strong>${escapeHtml(song.title)}</strong> - ${escapeHtml(song.artist.name)}
            </div>
        `).join("");
    } catch (error) {
        console.error("GET liked songs failed:", error);
        const container = document.getElementById("likedSongsContainer");
        if (container) container.innerHTML = "<p style='color:red;'>Could not load liked songs. Is backend running?</p>";
    }
}

// Show the liked songs section (hidden by default)
function showLikedSongs() {
    const likedSection = document.getElementById("likedSongsSection");
    if (likedSection) {
        likedSection.style.display = "block";
        fetchLikedSongs();  // load fresh data
        likedSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Hide the liked songs section
function hideLikedSongs() {
    const likedSection = document.getElementById("likedSongsSection");
    if (likedSection) likedSection.style.display = "none";
}

// ===============================
// PLAYLISTS SECTION TOGGLE FUNCTIONS
// ===============================

// Close/hide the playlists section
function togglePlaylistsSection() {
    const section = document.getElementById("playlistsSection");
    if (section) section.style.display = "none";
}

// Open/show the playlists section, refresh content, and scroll to it
function showPlaylistsSection() {
    const section = document.getElementById("playlistsSection");
    if (section) {
        section.style.display = "block";
        fetchPlaylists();   // get latest playlists
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===============================
// INITIALIZATION
// ===============================

// Attach like button event listener (heart icon in player bar)
document.getElementById("likeBtn")?.addEventListener("click", likeCurrentSong);

// Load playlists when page first loads
fetchPlaylists();