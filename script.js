const searchInput = document.getElementById('searchInput');
const resultsSection = document.getElementById('search-results-section');
const resultsGrid = document.getElementById('search-results-grid');
const audioPlayer = new Audio();

function searchSongs() {
    const query = searchInput.value.trim();
    if (!query) return;

    resultsSection.style.display = "block";
    resultsGrid.innerHTML = "<p style='padding: 20px;'>Searching for tunes...</p>";
    resultsSection.scrollIntoView({ behavior: 'smooth' });

    const script = document.createElement('script');
    script.src = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&output=jsonp&callback=handleSearchResponse`;
    
    document.body.appendChild(script);
    script.onload = () => script.remove();
}

window.handleSearchResponse = function(data) {
    if (data && data.data && data.data.length > 0) {
        displayResults(data.data);
    } else {
        resultsGrid.innerHTML = "<p style='padding: 20px;'>No songs found. Try another search!</p>";
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
                <img src="${song.album.cover_medium}" alt="${song.title}">
                <div class="play-overlay">▶</div>
            </div>
            <h4>${song.title}</h4>
            <p>${song.artist.name}</p>
        `;

        resultsGrid.appendChild(card);
    });
}

function playSong(url, song) {
    if (!url) {
        alert("Preview not available");
        return;
    }

    audioPlayer.src = url;
    audioPlayer.play();

    const playerBar = document.getElementById('player-bar');
    playerBar.style.display = 'flex';

    document.getElementById('p-img').src = song.album.cover_medium;
    document.getElementById('p-title').innerText = song.title;
    document.getElementById('p-artist').innerText = song.artist.name;

    document.getElementById('masterPlay').classList.remove('fa-circle-play');
    document.getElementById('masterPlay').classList.add('fa-circle-pause');
}

document.getElementById('masterPlay').addEventListener('click', () => {
    if (audioPlayer.paused) {
        audioPlayer.play();
        document.getElementById('masterPlay').classList.remove('fa-circle-play');
        document.getElementById('masterPlay').classList.add('fa-circle-pause');
    } else {
        audioPlayer.pause();
        document.getElementById('masterPlay').classList.remove('fa-circle-pause');
        document.getElementById('masterPlay').classList.add('fa-circle-play');
    }
});

function closeSearch() {
    resultsSection.style.display = "none";
    searchInput.value = "";
    audioPlayer.pause();
}

function togglePlay(element) {
    const artistName = element.querySelector('p').innerText;
    searchInput.value = artistName;
    searchSongs();
}

document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    });
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchSongs();
});

function handleSignIn() {
    alert("Sign In coming soon!");
}