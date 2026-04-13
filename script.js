const searchInput = document.getElementById('searchInput');
const resultsSection = document.getElementById('search-results-section');
const resultsGrid = document.getElementById('search-results-grid');
const audioPlayer = new Audio();

async function searchSongs() {
    const query = searchInput.value.trim();
    if (!query) return;

    resultsSection.style.display = "block";
    resultsGrid.innerHTML = "<p style='padding:20px;'>Searching for tunes...</p>";

    try {
        const response = await fetch(
            `https://cors-anywhere.herokuapp.com/https://api.deezer.com/search?q=${encodeURIComponent(query)}`
        );

        const data = await response.json();

        if (data.data && data.data.length > 0) {
            displayResults(data.data);
        } else {
            resultsGrid.innerHTML = "<p style='padding:20px;'>No songs found.</p>";
        }

    } catch (error) {
        console.error(error);
        resultsGrid.innerHTML = "<p style='padding:20px;'>Error fetching songs.</p>";
    }
}

function displayResults(songs) {
    resultsGrid.innerHTML = "";

    songs.forEach(song => {
        const card = document.createElement('div');
        card.className = 'song-card';

        card.onclick = () => playSong(song.preview);

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

function playSong(url) {
    if (!url) return alert("Preview not available");

    audioPlayer.pause();
    audioPlayer.src = url;
    audioPlayer.play();

    showNowPlaying();
}

function showNowPlaying() {
    let bar = document.getElementById("nowPlaying");

    if (!bar) {
        bar = document.createElement("div");
        bar.id = "nowPlaying";
        bar.style.position = "fixed";
        bar.style.bottom = "0";
        bar.style.left = "0";
        bar.style.right = "0";
        bar.style.background = "#111";
        bar.style.color = "white";
        bar.style.padding = "10px";
        bar.style.textAlign = "center";
        document.body.appendChild(bar);
    }

    bar.style.display = "block";
    bar.textContent = "Now Playing 🎵";
}

function closeSearch() {
    resultsSection.style.display = "none";
    searchInput.value = "";
    audioPlayer.pause();
}

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchSongs();
});

function handleSignIn() {
    alert("Coming soon!");
}

function togglePlay(card) {
    const artist = card.innerText;
    searchInput.value = artist;
    searchSongs();
}