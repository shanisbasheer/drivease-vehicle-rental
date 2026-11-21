document.addEventListener("DOMContentLoaded", () => {

  const STORAGE_KEY = "driveEaseBookings";
  const DELIVERY_CHARGE = 200;
  const ADVANCE_PERCENT = 20;

  // These IDs and prices match Partner 1's vehicles.js.
  const vehicles = {
    "car-01": {
      name: "Maruti Suzuki Swift",
      type: "Car",
      price: 1200
    },
    "car-02": {
      name: "Hyundai Creta",
      type: "Car",
      price: 2800
    },
    "bike-01": {
      name: "Hero Splendor Plus",
      type: "Bike",
      price: 450
    },
    "bike-02": {
      name: "Yamaha R15",
      type: "Bike",
      price: 1100
    },
    "scooter-01": {
      name: "Honda Activa 6G",
      type: "Scooter",
      price: 400
    },
    "scooter-02": {
      name: "TVS Ntorq 125",
      type: "Scooter",
      price: 600
    }
  };

  const money = (amount) =>
    "₹" + Number(amount).toLocaleString("en-IN");

  function getBookings() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      console.error("Could not read bookings:", error);
      return [];
    }
  }

  function saveBookings(bookings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };
      return entities[character];
    });
  }

  function parseLocalDate(value) {
    const parts = value.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function formatDate(value) {
    return parseLocalDate(value).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // ---------------------------------
  // BOOKING PAGE
  // ---------------------------------

  const bookingForm = document.getElementById("booking-form");

  if (bookingForm) {
    const params = new URLSearchParams(window.location.search);
    const vehicleId = params.get("vehicle");
    const vehicle = vehicles[vehicleId];

    const vehicleContainer =
      document.getElementById("selected-vehicle");

    if (!vehicle) {
      vehicleContainer.innerHTML = `
        <p class="error-message">
          Vehicle not found. Please select a vehicle from the listings.
        </p>
        <a href="vehicles.html" class="p2-secondary-link">
          Browse Vehicles
        </a>
      `;

      bookingForm.hidden = true;
      return;
    }

    vehicleContainer.innerHTML = `
      <div class="vehicle-summary">
        <div>
          <span class="p2-eyebrow">${escapeHTML(vehicle.type)}</span>
          <h3>${escapeHTML(vehicle.name)}</h3>
          <p>Vehicle ID: ${escapeHTML(vehicleId)}</p>
        </div>
        <strong>${money(vehicle.price)} / day</strong>
      </div>
    `;

    const startInput = document.getElementById("start-date");
    const endInput = document.getElementById("end-date");
    const locationInput = document.getElementById("pickup-location");
    const deliveryInput = document.getElementById("delivery-option");

    const today = getTodayString();
    startInput.min = today;
    endInput.min = today;

    const homepageDate = params.get("date");

    if (homepageDate && /^\d{4}-\d{2}-\d{2}$/.test(homepageDate)
        && homepageDate >= today) {
      startInput.value = homepageDate;
    }

    const homepageLocation = params.get("location");

    if (homepageLocation) {
      locationInput.value = homepageLocation;
    }

    function calculateRental() {
      let days = 1;

      if (startInput.value && endInput.value) {
        const start = parseLocalDate(startInput.value);
        const end = parseLocalDate(endInput.value);
        const difference = end.getTime() - start.getTime();

        if (difference >= 0) {
          days = Math.max(1, Math.round(
            difference / (1000 * 60 * 60 * 24)
          ));
        }
      }

      const rentalTotal = vehicle.price * days;
      const deliveryFee =
        deliveryInput.value === "doorstep" ? DELIVERY_CHARGE : 0;

      const grandTotal = rentalTotal + deliveryFee;
      const advance = Math.round(
        grandTotal * ADVANCE_PERCENT / 100
      );

      document.getElementById("daily-price").textContent =
        money(vehicle.price);

      document.getElementById("rental-days").textContent =
        `${days} ${days === 1 ? "day" : "days"}`;

      document.getElementById("rental-total").textContent =
        money(rentalTotal);

      document.getElementById("delivery-fee").textContent =
        money(deliveryFee);

      document.getElementById("grand-total").textContent =
        money(grandTotal);

      document.getElementById("advance-amount").textContent =
        money(advance);

      return {
        days,
        rentalTotal,
        deliveryFee,
        grandTotal,
        advance
      };
    }

    startInput.addEventListener("change", () => {
      endInput.min = startInput.value || today;

      if (endInput.value && endInput.value < startInput.value) {
        endInput.value = startInput.value;
      }

      calculateRental();
    });

    endInput.addEventListener("change", calculateRental);
    deliveryInput.addEventListener("change", calculateRental);

    calculateRental();

    bookingForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!bookingForm.reportValidity()) return;

      if (!startInput.value || !endInput.value) {
        alert("Please select both rental dates.");
        return;
      }

      if (startInput.value < today) {
        alert("Pickup date cannot be in the past.");
        return;
      }

      if (endInput.value < startInput.value) {
        alert("Return date must be on or after pickup date.");
        return;
      }

      const name =
        document.getElementById("customer-name").value.trim();

      const phone =
        document.getElementById("customer-phone").value.trim();

      const email =
        document.getElementById("customer-email").value.trim();

      const location = locationInput.value.trim();

      if (!name || !phone || !email || !location) {
        alert("Please complete all required fields.");
        return;
      }

      const costs = calculateRental();

      const booking = {
        id: "DE" + Date.now(),
        vehicleId,
        vehicleName: vehicle.name,
        vehicleType: vehicle.type,
        dailyPrice: vehicle.price,
        customerName: name,
        phone,
        email,
        startDate: startInput.value,
        endDate: endInput.value,
        days: costs.days,
        location,
        deliveryOption: deliveryInput.value,
        rentalTotal: costs.rentalTotal,
        deliveryFee: costs.deliveryFee,
        grandTotal: costs.grandTotal,
        advance: costs.advance,
        remaining: costs.grandTotal - costs.advance,
        status: "Upcoming",
        createdAt: new Date().toISOString()
      };

      const paymentConfirmed = window.confirm(
        `Demo payment confirmation\n\n` +
        `Vehicle: ${vehicle.name}\n` +
        `Total: ${money(costs.grandTotal)}\n` +
        `Advance payment (20%): ${money(costs.advance)}\n\n` +
        `Simulate successful advance payment?`
      );

      if (!paymentConfirmed) return;

      try {
        const bookings = getBookings();
        bookings.push(booking);
        saveBookings(bookings);

        document.getElementById("confirmation-message").textContent =
          "Your demo booking has been saved successfully.";

        document.getElementById("confirmation-details").innerHTML = `
          <p><strong>Booking ID:</strong> ${escapeHTML(booking.id)}</p>
          <p><strong>Vehicle:</strong> ${escapeHTML(vehicle.name)}</p>
          <p><strong>Pickup:</strong> ${formatDate(booking.startDate)}</p>
          <p><strong>Total:</strong> ${money(booking.grandTotal)}</p>
          <p><strong>Demo advance:</strong> ${money(booking.advance)}</p>
        `;

        document.getElementById("confirmation-modal").hidden = false;

      } catch (error) {
        console.error("Could not save booking:", error);
        alert("Unable to save the booking. Please check browser storage.");
      }
    });
  }

  // ---------------------------------
  // DASHBOARD PAGE
  // ---------------------------------

  const historyContainer =
    document.getElementById("booking-history");

  if (historyContainer) {
    renderDashboard();
  }

  function renderDashboard() {
    const bookings = getBookings();
    const today = getTodayString();

    const upcoming = bookings.filter((booking) =>
      booking.status === "Upcoming" && booking.endDate >= today
    );

    const completed = bookings.filter((booking) =>
      booking.status === "Completed" ||
      (booking.status === "Upcoming" && booking.endDate < today)
    );

    document.getElementById("total-bookings").textContent =
      bookings.length;

    document.getElementById("upcoming-bookings").textContent =
      upcoming.length;

    document.getElementById("completed-bookings").textContent =
      completed.length;

    if (bookings.length === 0) {
      historyContainer.innerHTML = `
        <div class="empty-message">
          <h3>No bookings yet</h3>
          <p>Your vehicle reservations will appear here.</p>
          <a href="vehicles.html" class="p2-primary-btn">
            Explore Vehicles
          </a>
        </div>
      `;
      return;
    }

    historyContainer.innerHTML = bookings
      .slice()
      .reverse()
      .map((booking) => {
        const isPast = booking.endDate < today;
        const status = booking.status === "Cancelled"
          ? "Cancelled"
          : isPast ? "Completed" : "Upcoming";

        const canCancel =
          status === "Upcoming" && booking.startDate >= today;

        return `
          <article class="booking-record">
            <div class="record-top">
              <div>
                <span class="p2-eyebrow">
                  ${escapeHTML(booking.id)}
                </span>
                <h3>${escapeHTML(booking.vehicleName)}</h3>
                <p>${escapeHTML(booking.vehicleType)}</p>
              </div>

              <span class="booking-status status-${status.toLowerCase()}">
                ${status}
              </span>
            </div>

            <div class="record-details">
              <p><strong>Pickup:</strong>
                ${formatDate(booking.startDate)}</p>
              <p><strong>Return:</strong>
                ${formatDate(booking.endDate)}</p>
              <p><strong>Duration:</strong>
                ${booking.days} days</p>
              <p><strong>Total:</strong>
                ${money(booking.grandTotal)}</p>
              <p><strong>Advance:</strong>
                ${money(booking.advance)}</p>
              <p><strong>Location:</strong>
                ${escapeHTML(booking.location)}</p>
            </div>

            ${
              canCancel
                ? `<button class="p2-cancel-btn"
                    data-booking-id="${escapeHTML(booking.id)}">
                    Cancel Booking
                  </button>`
                : ""
            }
          </article>
        `;
      })
      .join("");

    historyContainer
      .querySelectorAll(".p2-cancel-btn")
      .forEach((button) => {
        button.addEventListener("click", () => {
          cancelBooking(button.dataset.bookingId);
        });
      });
  }

  function cancelBooking(bookingId) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    const bookings = getBookings();

    const updatedBookings = bookings.map((booking) => {
      if (booking.id === bookingId &&
          booking.status === "Upcoming") {
        return {
          ...booking,
          status: "Cancelled"
        };
      }

      return booking;
    });

    saveBookings(updatedBookings);
    renderDashboard();
  }

});