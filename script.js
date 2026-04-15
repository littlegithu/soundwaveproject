const searchInput = document.getElementById('searchInput');
const resultsSection = document.getElementById('search-results-section');
const resultsGrid = document.getElementById('search-results-grid');
const audioPlayer = new Audio();
let isRepeating = false;

function searchSongs() {
    const query = searchInput.value.trim();
    if (!query) return;

    resultsSection.style.display = "block";
    resultsGrid.innerHTML = "<p style='padding: 20px;'>Searching...</p>";

    const script = document.createElement('script');
    script.src = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&output=jsonp&callback=handleSearchResponse`;

    document.body.appendChild(script);
    script.onload = () => script.remove();
}

window.handleSearchResponse = function(data) {
    if (data && data.data && data.data.length > 0) {
        displayResults(data.data);
    } else {
        resultsGrid.innerHTML = "<p style='padding: 20px;'>No songs found.</p>";
    }
};

function albumSearch(albumTitle, artistName) {
    resultsSection.style.display = "block";
    resultsGrid.innerHTML = "<p style='padding: 20px;'>Loading album tracks...</p>";
    
    const query = `album:"${albumTitle}" artist:"${artistName}"`;
    const script = document.createElement('script');
    script.src = `https://deezer.com{encodeURIComponent(query)}&output=jsonp&callback=handleAlbumID`;
    document.body.appendChild(script);
    script.onload = () => script.remove();
}

window.handleAlbumID = function(data) {
    if (data.data && data.data.length > 0) {
        const albumID = data.data[0].id;
        const script = document.createElement('script');
        script.src = `https://deezer.com{albumID}/tracks?output=jsonp&callback=handleSearchResponse`;
        document.body.appendChild(script);
        script.onload = () => script.remove();
    } else {
        resultsGrid.innerHTML = "<p style='padding: 20px;'>Album not found.</p>";
    }
};

function playTrending(title, artist) {
    const query = `${title} ${artist}`;
    const script = document.createElement('script');
    script.src = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&output=jsonp&callback=handleTrendingPlay`;
    document.body.appendChild(script);
    script.onload = () => script.remove();
}

window.handleTrendingPlay = function(data) {
    if (data && data.data && data.data.length > 0) {
        playSong(data.data[0].preview, data.data[0]);
    }
};

function displayResults(songs) {
    resultsGrid.innerHTML = "";
    songs.forEach(song => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.onclick = () => playSong(song.preview, song);
        card.innerHTML = `
            <div class="album-wrapper">
                <img src="${song.album ? song.album.cover_medium : 'Assets/default.png'}" onerror="this.src='Assets/default.png'">
                <div class="play-overlay">▶</div>
            </div>
            <h4>${song.title}</h4>
            <p>${song.artist.name}</p>
        `;
        resultsGrid.appendChild(card);
    });
}

function playSong(url, song) {
    if (!url) return alert("Preview not available");

    audioPlayer.src = url;
    audioPlayer.currentTime = 0;
    audioPlayer.play();

    const playerBar = document.getElementById('player-bar');
    if (playerBar) {
        playerBar.style.display = 'flex';
        const vSlider = document.getElementById('volumeSlider');
        if (vSlider) {
            const val = vSlider.value;
            vSlider.style.background = `linear-gradient(90deg, #1cc8d1 0%, #005f73 ${val}%, #282828 ${val}%)`;
        }
    }
    
    document.getElementById('p-img').src = song.album ? song.album.cover_medium : 'Assets/default.png';
    document.getElementById('p-title').innerText = song.title;
    document.getElementById('p-artist').innerText = song.artist.name;
    document.getElementById('masterPlay').className = 'fa-solid fa-circle-pause';
}

document.getElementById('masterPlay')?.addEventListener('click', () => {
    const btn = document.getElementById('masterPlay');
    if (audioPlayer.paused) {
        audioPlayer.play();
        btn.className = 'fa-solid fa-circle-pause';
    } else {
        audioPlayer.pause();
        btn.className = 'fa-solid fa-circle-play';
    }
});

document.getElementById('volumeSlider')?.addEventListener('input', (e) => {
    const value = e.target.value;
    audioPlayer.volume = value / 100;
    e.target.style.background = `linear-gradient(90deg, #1cc8d1 0%, #005f73 ${value}%, #282828 ${value}%)`;
});

document.getElementById('repeatBtn')?.addEventListener('click', () => {
    isRepeating = !isRepeating;
    audioPlayer.loop = isRepeating;
    document.getElementById('repeatBtn').style.color = isRepeating ? "#1db954" : "#b3b3b3";
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchSongs();
});

function togglePlay(element) {
    const artistName = element.querySelector('p').innerText;
    searchInput.value = artistName;
    searchSongs();
}

function closeSearch() {
    resultsSection.style.display = "none";
}

function handleSignIn() {
    alert("Sign In coming soon!");
}
