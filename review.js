import { stations } from './station.js';

const STATION_URL = document.body.dataset.stationUrl;
const station = stations.find(s => s.url === STATION_URL);

function getAllReviews() {
  return JSON.parse(localStorage.getItem('reviews')) || {};
}
function saveAllReviews(allReviews) {
  localStorage.setItem('reviews', JSON.stringify(allReviews));
}

if (!station) {
  alert('해당 역 정보를 찾을 수 없습니다.');
} else {
  document.getElementById('stationTitle').textContent = `${station.name}역 후기`;

  // 지도 표시
  const map = new kakao.maps.Map(
    document.getElementById('map'),
    { center: new kakao.maps.LatLng(station.lat, station.lng), level: 3 }
  );
  new kakao.maps.Marker({ position: new kakao.maps.LatLng(station.lat, station.lng), map });

  // 별점/후기 로직
  let allReviews = getAllReviews();
  let reviews = allReviews[station.url] || [];
  let currentStar = 0;

  document.querySelectorAll('#starContainer span').forEach((star, i) => {
    star.addEventListener('click', () => {
      currentStar = i + 1;
      document.querySelectorAll('#starContainer span').forEach((s, j) =>
        s.classList.toggle('on', j < currentStar)
      );
    });
  });

  document.getElementById('addReviewBtn').addEventListener('click', () => {
    const text = document.getElementById('reviewText').value.trim();
    if (currentStar === 0 || !text) {
      alert('별점과 후기를 모두 입력해주세요');
      return;
    }
    reviews.unshift({ star: currentStar, text });
    allReviews[station.url] = reviews;
    saveAllReviews(allReviews);
    updateAvg();
    renderReviews();
    currentStar = 0;
    document.querySelectorAll('#starContainer span').forEach(s => s.classList.remove('on'));
    document.getElementById('reviewText').value = '';
  });

  function updateAvg() {
    const avg = reviews.length
      ? (reviews.reduce((a, b) => a + b.star, 0) / reviews.length).toFixed(1)
      : '0.0';
    document.getElementById('avgRating').textContent = avg;
  }

  function renderReviews() {
    const reviewsDiv = document.getElementById('reviews');
    reviewsDiv.innerHTML = '';
    reviews.forEach(r => {
      const div = document.createElement('div');
      div.className = 'review';
      div.innerHTML = `<strong>★${r.star}</strong> ${r.text}`;
      reviewsDiv.appendChild(div);
    });
  }

  updateAvg();
  renderReviews();
}