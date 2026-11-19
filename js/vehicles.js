document.addEventListener("DOMContentLoaded", () => {

  // DEMO VEHICLE COLLECTION
  const vehicles = [
    {
      id: "car-01",
      name: "Maruti Suzuki Swift",
      subtitle: "Economy Hatchback",
      type: "car",
      price: 1200,
      status: "available",
      transmission: "Manual",
      fuel: "Petrol",
      seats: "5 Seats",
      image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=85"
    },
    {
      id: "car-02",
      name: "Hyundai Creta",
      subtitle: "Premium SUV",
      type: "car",
      price: 2800,
      status: "booked",
      transmission: "Automatic",
      fuel: "Petrol",
      seats: "5 Seats",
      image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1000&q=85"
    },
    {
      id: "bike-01",
      name: "Hero Splendor Plus",
      subtitle: "Commuter Bike",
      type: "bike",
      price: 450,
      status: "available",
      transmission: "Manual",
      fuel: "Petrol",
      seats: "2 Seats",
      image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=85"
    },
    {
      id: "bike-02",
      name: "Yamaha R15",
      subtitle: "Sports Bike",
      type: "bike",
      price: 1100,
      status: "rented",
      transmission: "Manual",
      fuel: "Petrol",
      seats: "2 Seats",
      image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=85"
    },
    {
      id: "scooter-01",
      name: "Honda Activa 6G",
      subtitle: "Standard Scooter",
      type: "scooter",
      price: 400,
      status: "available",
      transmission: "Automatic",
      fuel: "Petrol",
      seats: "2 Seats",
      image: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1000&q=85"
    },
    {
      id: "scooter-02",
      name: "TVS Ntorq 125",
      subtitle: "Premium Scooter",
      type: "scooter",
      price: 600,
      status: "maintenance",
      transmission: "Automatic",
      fuel: "Petrol",
      seats: "2 Seats",
      image: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=1000&q=85"
    }
  ];

  // HTML ELEMENTS
  const vehicleGrid = document.getElementById("vehicle-grid");
  const resultsCount = document.getElementById("results-count");
  const noResults = document.getElementById("no-results");

  const searchInput = document.getElementById("vehicle-search");
  const priceFilter = document.getElementById("price-filter");
  const availabilityFilter = document.getElementById("availability-filter");

  const categoryTabs = document.querySelectorAll(".category-tab");
  const resetButton = document.getElementById("reset-filters");
  const noResultsReset = document.getElementById("no-results-reset");

  // CURRENT FILTER STATE
  let selectedCategory = "all";

  // READ SEARCH DETAILS FROM HOMEPAGE
  const urlParams = new URLSearchParams(window.location.search);

  const homepageType = urlParams.get("type");
  const homepageLocation = urlParams.get("location");
  const homepageDate = urlParams.get("date");

  if (homepageType && ["car", "bike", "scooter"].includes(homepageType)) {
    selectedCategory = homepageType;
  }

  // UPDATE CATEGORY TAB APPEARANCE
  function updateCategoryTabs() {
    categoryTabs.forEach((tab) => {
      const isActive = tab.dataset.category === selectedCategory;
      tab.classList.toggle("active", isActive);
    });
  }

  // FORMAT VEHICLE STATUS
  function getStatusLabel(status) {
    const labels = {
      available: "Available",
      booked: "Booked",
      rented: "Currently Rented",
      maintenance: "Maintenance"
    };

    return labels[status] || "Unavailable";
  }

  // RENDER VEHICLE CARDS
  function renderVehicles(vehicleList) {
    vehicleGrid.innerHTML = "";

    vehicleList.forEach((vehicle) => {
      const card = document.createElement("article");
      card.className = "vehicle-card";

      const image = document.createElement("img");
      image.src = vehicle.image;
      image.alt = vehicle.name;
      image.loading = "lazy";

      // Use a fallback background if an external image fails.
      image.addEventListener("error", () => {
        image.style.display = "none";
      });

      const imageWrap = document.createElement("div");
      imageWrap.className = "vehicle-image-wrap";
      imageWrap.appendChild(image);

      const top = document.createElement("div");
      top.className = "vehicle-card-top";

      const typeLabel = document.createElement("span");
      typeLabel.className = "vehicle-type-label";
      typeLabel.textContent = vehicle.type;

      const status = document.createElement("span");
      status.className = `vehicle-status status-${vehicle.status}`;
      status.textContent = getStatusLabel(vehicle.status);

      top.append(typeLabel, status);

      const content = document.createElement("div");
      content.className = "vehicle-card-content";

      const title = document.createElement("h3");
      title.className = "vehicle-model";
      title.textContent = vehicle.name;

      const subtitle = document.createElement("p");
      subtitle.className = "vehicle-subtitle";
      subtitle.textContent = vehicle.subtitle;

      const price = document.createElement("div");
      price.className = "vehicle-price";
      price.textContent = `₹${vehicle.price.toLocaleString("en-IN")}`;

      const priceUnit = document.createElement("span");
      priceUnit.textContent = " / day";
      price.appendChild(priceUnit);

      const specs = document.createElement("div");
      specs.className = "vehicle-specs";

      const specData = [
        ["Transmission", vehicle.transmission],
        ["Fuel", vehicle.fuel],
        ["Capacity", vehicle.seats]
      ];

      specData.forEach(([label, value]) => {
        const spec = document.createElement("div");
        spec.className = "vehicle-spec";

        const strong = document.createElement("strong");
        strong.textContent = value;

        const small = document.createElement("span");
        small.textContent = label;

        spec.append(strong, small);
        specs.appendChild(spec);
      });

      const bottom = document.createElement("div");
      bottom.className = "vehicle-card-bottom";

      const rentButton = document.createElement("button");
      rentButton.className = "rent-btn";
      rentButton.type = "button";

      if (vehicle.status === "available") {
        rentButton.textContent = "Rent Now ↗";

        rentButton.addEventListener("click", () => {
          const bookingParams = new URLSearchParams({
            vehicle: vehicle.id
          });

          if (homepageLocation) {
            bookingParams.set("location", homepageLocation);
          }

          if (homepageDate) {
            bookingParams.set("date", homepageDate);
          }

          window.location.href =
            `booking.html?${bookingParams.toString()}`;
        });
      } else {
        rentButton.disabled = true;

        if (vehicle.status === "maintenance") {
          rentButton.textContent = "Under Maintenance";
        } else if (vehicle.status === "booked") {
          rentButton.textContent = "Already Booked";
        } else {
          rentButton.textContent = "Currently Rented";
        }
      }

      bottom.appendChild(rentButton);

      content.append(title, subtitle, price, specs, bottom);
      card.append(top, imageWrap, content);

      vehicleGrid.appendChild(card);
    });

    resultsCount.textContent =
      `Showing ${vehicleList.length} of ${vehicles.length} vehicles`;

    noResults.hidden = vehicleList.length !== 0;
    vehicleGrid.hidden = vehicleList.length === 0;
  }

  // APPLY ALL FILTERS
  function applyFilters() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const maximumPrice = priceFilter.value;
    const selectedAvailability = availabilityFilter.value;

    let filteredVehicles = vehicles.filter((vehicle) => {

      const matchesCategory =
        selectedCategory === "all" ||
        vehicle.type === selectedCategory;

      const matchesSearch =
        vehicle.name.toLowerCase().includes(searchTerm) ||
        vehicle.subtitle.toLowerCase().includes(searchTerm) ||
        vehicle.type.toLowerCase().includes(searchTerm);

      const matchesPrice =
        maximumPrice === "all" ||
        vehicle.price <= Number(maximumPrice);

      const matchesAvailability =
        selectedAvailability === "all" ||
        vehicle.status === selectedAvailability;

      return (
        matchesCategory &&
        matchesSearch &&
        matchesPrice &&
        matchesAvailability
      );
    });

    updateCategoryTabs();
    renderVehicles(filteredVehicles);
  }

  // CATEGORY BUTTON EVENTS
  categoryTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      selectedCategory = tab.dataset.category;
      applyFilters();
    });
  });

  // SEARCH AND FILTER EVENTS
  searchInput.addEventListener("input", applyFilters);
  priceFilter.addEventListener("change", applyFilters);
  availabilityFilter.addEventListener("change", applyFilters);

  // RESET ALL FILTERS
  function resetFilters() {
    selectedCategory = "all";
    searchInput.value = "";
    priceFilter.value = "all";
    availabilityFilter.value = "all";

    applyFilters();
  }

  resetButton.addEventListener("click", resetFilters);
  noResultsReset.addEventListener("click", resetFilters);

  // INITIAL RENDER
  updateCategoryTabs();
  applyFilters();
});