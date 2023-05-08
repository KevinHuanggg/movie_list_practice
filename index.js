const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";

const movies = []; //電影總清單
let filteredMovies = []; //搜尋清單

const MOVIES_PER_PAGE = 12;

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");

// 以下為本次練習新增內容
// getMoviesByPage()通通帶入變數page存取當下點擊頁數後該停在哪一頁資料

const modeBtn = document.querySelector("#mode-btn");
let renderMode = "card";
let page = 1;

// listen to mode-button
modeBtn.addEventListener("click", function onCardModeClicked(event) {
  if (event.target.matches(".fa-th")) {
    renderMode = "";
    renderMode = "card";
    renderMovieList(getMoviesByPage(page));
  } else if (event.target.matches(".fa-bars")) {
    renderMode = "";
    renderMode = "list";
    renderMovieList(getMoviesByPage(page));
  }
});

function renderMovieList(data) {
  let rawHTML = "";
  if (renderMode === "card") {
    data.forEach((item) => {
      // title, image, id
      rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${
          POSTER_URL + item.image
        }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button 
            class="btn btn-primary 
            btn-show-movie" 
            data-bs-toggle="modal" 
            data-bs-target="#movie-modal" 
            data-id="${item.id}"
          >
            More
          </button>
          <button 
            class="btn btn-info btn-add-favorite" 
            data-id="${item.id}"
          >
            +
          </button>
        </div>
      </div>
    </div>
  </div>`;
    });
    dataPanel.innerHTML = rawHTML;
  } else if (renderMode === "list") {
    let rawHTML = "";
    rawHTML += `<div class="container mt-5">`;
    data.forEach((item) => {
      rawHTML += `
    <div class="container-xxl d-flex justify-content-between mt-4">
    <div class="container">${item.title}</div>
    <div class="container" style="text-align:right">
      <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
      <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
    </div>
  </div>`;
    });
    rawHTML += `</div>`;
    dataPanel.innerHTML = rawHTML;
  }
}

// 監聽表單提交事件
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
  }
  renderPaginator(filteredMovies.length);
  renderMovieList(getMoviesByPage(1));
});

//到此為修改內容

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;

  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

function showMovieModal(id) {
  // get elements
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  // send request to show api
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;

    // insert data into modal ui
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster" class="img-fluid">`;
  });
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);

  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中！");
  }

  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

// listen to data panel
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(event.target.dataset.id);
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

// listen to paginator
paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return;

  page = Number(event.target.dataset.page);
  renderMovieList(getMoviesByPage(page));
});

// send request to index api
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(page));
  })
  .catch((err) => console.log(err));
