import { stations } from './station.js';

export { renderStations, getFavorites, stations };

// 역 url에서 마지막 부분만 추출해서 review-xxx.html로 만드는 함수
function getStationUrl(station) {
    // 예: url이 "/daegok"이면 "daegok" 추출
    const urlPart = station.url.replace(/^\//, ''); // 맨 앞 슬래시 제거
    return `review-${urlPart}.html`;
}

// 카드 렌더링 함수
function renderStations(list) {
    const grid = document.getElementById('stationGrid');
    grid.innerHTML = '';
    list.forEach(station => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.station = station.name;
        card.dataset.stationUrl = station.url;
        card.innerHTML = `
            <a href="${getStationUrl(station)}">
                <img src="${station.img}" alt="${station.name}역" class="station-img">
            </a>
            <div class="header">
                <span>${station.name}역</span>
                <span class="heart" data-station="${station.name}">♡</span>
            </div>
            <div class="rating">평균 평점: <span id="rate-${station.name}">0.0</span></div>
        `;
        grid.appendChild(card);
    });
    updateHearts();
    attachHeartEvents();
    updateRatings();
}

// 하트(즐겨찾기) 관리
function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
}
function setFavorites(favorites) {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}
function toggleHeart(stationName, el) {
    let favorites = getFavorites();
    const idx = favorites.indexOf(stationName);
    if (idx > -1) {
        favorites.splice(idx, 1);
        el.textContent = '♡';
        el.classList.remove('active');
    } else {
        favorites.push(stationName);
        el.textContent = '♥';
        el.classList.add('active');
    }
    setFavorites(favorites);
}

function attachHeartEvents(onUpdate) {
    document.querySelectorAll('.heart').forEach(heart => {
        heart.onclick = function(e) {
            e.stopPropagation();
            toggleHeart(this.dataset.station, this);
            if (onUpdate) onUpdate();
        };
    });
}

function updateHearts() {
    const favorites = getFavorites();
    document.querySelectorAll('.heart').forEach(heart => {
        if (favorites.includes(heart.dataset.station)) {
            heart.textContent = '♥';
            heart.classList.add('active');
        } else {
            heart.textContent = '♡';
            heart.classList.remove('active');
        }
    });
}

// 별점(평균 평점) 관리
function updateRatings() {
    const reviews = JSON.parse(localStorage.getItem('reviews')) || {};
    document.querySelectorAll('.card').forEach(card => {
        const url = card.dataset.stationUrl;
        const rateEl = card.querySelector('.rating span');
        const arr = reviews[url] || [];
        rateEl.textContent = arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : '0.0';
    });
}

// 검색 기능
document.getElementById('searchInput').addEventListener('input', function () {
    const term = this.value.trim().toLowerCase();
    if (!term) {
        renderStations([]);
        document.getElementById('emptyMessage').style.display = 'none';
        return;
    }
    const filtered = stations.filter(station =>
        station.name.toLowerCase().includes(term)
    );
    renderStations(filtered);
    document.getElementById('emptyMessage').style.display = filtered.length ? 'none' : '';
    if (filtered.length === 0) {
        document.getElementById('emptyMessage').style.display = '';
    }
});

// 최초에는 아무것도 안 보이게
renderStations([]);