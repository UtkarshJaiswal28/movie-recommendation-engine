  const API_KEY = "8459ae6c";
  const GEMINI_API_KEY = "AIzaSyBk6h-w8t1jOJuIqolrzW7lzU_o7L267N4";

  // Get elements
  const searchInput = document.getElementById("searchinput");
  const searchButton = document.querySelector(".searchbutton");
  const movieResults = document.getElementById("movieResults");
  const modal = document.getElementById("movieModal");
  const modalContent = document.getElementById("modalContent");

  // search button
  searchButton.addEventListener("click", smartSearch);
 
  //search function
  async function smartSearch() {
    const query = searchInput.value.trim();
    if (query === "") {
      alert("Please enter a movie name or mood!");
      return;
    }

    movieResults.innerHTML = "Searching...";

    try {
        // Function to get movie suggestions from Gemini AI
      const geminiResponse = await fetch(
       "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Is this a mood or a movie/actor name? If mood, convert it into one genre keyword only. Input: ${query}`
              }]
            }]
          })
        }
      );

      const geminiData = await geminiResponse.json();
      const aiText = geminiData.candidates[0].content.parts[0].text.toLowerCase();

      let finalSearchTerm = query;

      // detect mood
      if (
        aiText.includes("romance") ||
        aiText.includes("comedy") ||
        aiText.includes("action") ||
        aiText.includes("drama") ||
        aiText.includes("thriller") ||
        aiText.includes("horror")
      ) {
        finalSearchTerm = aiText.match(/romance|comedy|action|drama|thriller|horror/)[0];
      }

      fetchMovies(finalSearchTerm);

    } catch (error) {
      console.warn("Gemini AI failed.");
      fetchMovies(query); 
    }
  }

  //  Movies From OMDB
  async function fetchMovies(searchTerm) {
    const response = await fetch(
      `https://www.omdbapi.com/?s=${searchTerm}&apikey=${API_KEY}`
    );

    const data = await response.json();
    movieResults.innerHTML = "";

    if (data.Search) {
      data.Search.forEach(movie => {
        const card = document.createElement("div");
        card.className = "movie-card";
        card.innerHTML = `
          <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/160x220"}">
          <h4>${movie.Title}</h4>
        `;

        card.onclick = () => showMovieDetails(movie.imdbID);
        movieResults.appendChild(card);
      });
    } else {
      movieResults.innerHTML = "No movies found!";
    }
  }

  // movie details
  async function showMovieDetails(movieId) {
    modal.style.display = "flex";
    modalContent.innerHTML = "Loading details...";

    const response = await fetch(
      `https://www.omdbapi.com/?i=${movieId}&apikey=${API_KEY}`
    );
    const movie = await response.json();

    // similar movies
    const genreKeyword = movie.Genre.split(",")[0];

    const similarResponse = await fetch(
      `https://www.omdbapi.com/?s=${genreKeyword}&apikey=${API_KEY}`
    );
    const similarData = await similarResponse.json();

    let similarHTML = "";

    if (similarData.Search) {
      similarData.Search.slice(0, 6).forEach(sim => {
        similarHTML += `
          <img 
            src="${sim.Poster !== "N/A" ? sim.Poster : "https://via.placeholder.com/90x130"}"
            onclick="showMovieDetails('${sim.imdbID}')"
          >
        `;
      });
    }

    modalContent.innerHTML = `
      <span class="close-btn" onclick="closeModal()">✖</span>

      <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/180x260"}">

      <div>
        <h2>${movie.Title}</h2>
        <p><b>Year:</b> ${movie.Year}</p>
        <p><b>Rating:</b> ${movie.imdbRating}</p>
        <p><b>Genre:</b> ${movie.Genre}</p>
        <p><b>Actors:</b> ${movie.Actors}</p>
        <p><b>Plot:</b> ${movie.Plot}</p>

        <div class="similar-section">
          <div class="similar-title">Similar Movies</div>
          <div class="similar-movies">
            ${similarHTML || "No similar movies found"}
          </div>
        </div>
      </div>
    `;
  }

  // CLOSE POPUP
  function closeModal() {
    modal.style.display = "none";
  }

  window.onclick = function(e) {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  };



  



  