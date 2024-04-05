// Écoute l'événement de chargement complet du document pour démarrer la fonction de récupération et d'affichage des Pokémon.
document.addEventListener("DOMContentLoaded", () => {
    fetchAndDisplayPokemon();
});

// Fonction asynchrone pour récupérer les données des Pokémon depuis l'API et les afficher.
async function fetchAndDisplayPokemon() {
    console.log("Fetching and displaying Pokémon...");
    const pokemonApi = "https://pokeapi.co/api/v2/pokemon?limit=151";
    const searchInput = document.getElementById("pokemon-input");
   
    try {
        // Ajoute un gestionnaire d'événements pour filtrer les cartes Pokémon lorsqu'on appuie sur Entrée.
        searchInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                const searchTerm = searchInput.value.trim().toLowerCase();
                filterPokemonCards(searchTerm);
            }
        });
        // Récupère la liste des Pokémon et leurs détails de l'API.
        const pokemonList = await fetch(pokemonApi).then(res => res.json()).then(data => data.results);
        const pokemonDetails = await Promise.all(pokemonList.map(pokemon => fetchPokemonDetails(pokemon.url)));
        // Affiche les cartes des Pokémon.
        displayPokemonCards(pokemonDetails);
    } catch (error) {
        console.error("Failed to fetch Pokemon:", error);
    }
}

// Récupère les détails d'un Pokémon spécifique depuis l'API.
async function fetchPokemonDetails(url) {
    const details = await fetch(url).then(res => res.json());
    const speciesData = await fetch(details.species.url).then(res => res.json());
    return formatPokemonData(details, speciesData);
}

function formatPokemonData(data, speciesData) {
    return {
        // Définit la structure des données d'un Pokémon avec les informations nécessaires pour l'affichage.
        id: data.id,
        nameFr: capitalizeFirstLetter(findFrenchName(speciesData.names)),
        name: capitalizeFirstLetter(data.name),
        height: formatHeight(data.height),
        weight: formatWeight(data.weight),
        types: data.types.map(type => capitalizeFirstLetter(type.type.name)).join(", "),
        stats: {
            pv: data.stats[0].base_stat
        }
    };
}

// Affiche les cartes Pokémon dans l'interface utilisateur.
function displayPokemonCards(pokemonDetails) {
    console.log("Displaying Pokémon cards...");
    const container = document.getElementById("pokemonList");
    container.innerHTML = ''; // Clear existing content
    pokemonDetails.forEach(pokemon => {
        // Crée et ajoute chaque carte Pokémon au conteneur.
        const pokemonCard = document.createElement("div");
        pokemonCard.className = "pokemon-card";
        pokemonCard.dataset.pokemonId = pokemon.id;
        const cardHtml = generatePokemonCardHtml(pokemon);
        pokemonCard.innerHTML = cardHtml;
        container.appendChild(pokemonCard);
    });
}

// Génère le HTML pour une carte Pokémon.
    function generatePokemonCardHtml(pokemon) {
    // Génère le HTML pour afficher les détails d'un Pokémon sur sa carte.
    const types = pokemon.types.split(", "); // Convertir la chaîne de types en tableau.
    const typeBoxes = types.map(type => {
        const color = generateTypeColor(type);
        return `<span class="type-box" style="background-color: ${color};">${type}</span>`; // Utiliser generateTypeColor pour obtenir la couleur.
    }).join(""); // Générer des rectangles colorés pour chaque type.
    return `
        <div class="id-pv-container">
            <p class="card-id">${pokemon.id}</p>
            <p class="card-pv">${pokemon.stats.pv ? `PV: ${pokemon.stats.pv}` : ''}</p>
        </div>
        <h3 class="card-title">${pokemon.nameFr} (${pokemon.name})</h3>
        <img class="pokemon-img" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png" alt="${pokemon.name}" />
        <p class="card-text"><strong>Taille :</strong> ${pokemon.height}</p>
        <p class="card-text"><strong>Poids :</strong> ${pokemon.weight}</p>
        <p class="type">${typeBoxes}</p>
    `;
}


// Génère le HTML pour afficher les types d'un Pokémon à partir d'une chaîne de caractères représentant les types.
function generateTypesHtml(typesString) {
    const types = typesString.split(", ");
    return types.map(type => `<span class="type-box">${type}</span>`).join("");
}

// Fonction pour mettre en majuscule la première lettre d'une chaîne.
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Fonction pour ajuster la hauteur pour l'affichage.
function formatHeight(height) {
    return (height / 10).toFixed(1) + "m";
}

// Fonction pour ajuster le poids pour l'affichage.
function formatWeight(weight) {
    return (weight / 10).toFixed(1) + "kg";
}

// Trouve le nom français d'un Pokémon.
function findFrenchName(names) {
    return names.find(name => name.language.name === 'fr').name;
}

// Fonction pour rechercher les pokemon selon leur nom ou leur id.
function filterPokemonCards(searchValue) {
    const pokemonCards = document.querySelectorAll(".pokemon-card");
    pokemonCards.forEach(card => {
        const pokemonName = card.querySelector(".card-title").textContent.toLowerCase();
        const pokemonId = card.querySelector(".card-id").textContent;
        if (pokemonName.includes(searchValue) || pokemonId == searchValue) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
}

// Fonction pour générer la couleur en fonction du type de Pokémon.
function generateTypeColor(type) {
    const typeColors = {
        "Steel": "#B8B8D0",
        "Fighting": "#C03028",
        "Dragon": "#7038F8",
        "Water": "#6890F0",
        "Electric": "#F8D030",
        "Fairy": "#EE99AC",
        "Fire": "#F08030",
        "Ice": "#98D8D8",
        "Bug": "#A8B820",
        "Normal": "#A8A878",
        "Grass": "#78C850",
        "Poison": "#A040A0",
        "Psychic": "#F85888",
        "Rock": "#B8A038",
        "Ground": "#E0C068",
        "Ghost": "#705898",
        "Dark": "#705848",
        "Flying": "#A890F0",
    };
    return typeColors[type] || "#A8A878"; // Couleur par défaut si le type n'est pas trouvé
}

