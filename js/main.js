document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.getElementById("home-search-form");
  const pickupDate = document.getElementById("pickup-date");

  // Set today's date as the earliest pickup date.
  if (pickupDate) {
    const today = new Date();
    const localDate = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0")
    ].join("-");

    pickupDate.min = localDate;
  }

  // Homepage vehicle search.
  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const vehicleType = document.getElementById("vehicle-type").value;
      const location = document.getElementById("pickup-location").value.trim();
      const date = document.getElementById("pickup-date").value;

      if (!vehicleType || !location || !date) {
        alert("Please complete all search fields.");
        return;
      }

      const selectedDate = new Date(date + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        alert("Please select today or a future pickup date.");
        return;
      }

      const params = new URLSearchParams({
        type: vehicleType,
        location: location,
        date: date
      });

      window.location.href = `vehicles.html?${params.toString()}`;
    });
  }
});