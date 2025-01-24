document
  .getElementById("city-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const city = document.getElementById("city").value;
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      city
    )}&format=json&limit=1&addressdetails=1`;

    fetch(geocodeUrl)
      .then((response) => response.json())
      .then((data) => {
        const resultDiv = document.getElementById("result");
        resultDiv.innerHTML = "";
        resultDiv.classList.remove("show");

        if (data && data.length > 0) {
          const { display_name: displayName, lat, lon } = data[0];

          const locationInfoDiv = createInfoDiv("location-info", [
            `Stedsnavn: ${displayName}`,
            `Breddegrad: ${lat}`,
            `Lengdegrad: ${lon}`,
          ]);

          resultDiv.appendChild(locationInfoDiv);
          resultDiv.classList.add("show");
          getSunriseSunsetData(lat, lon);
        } else {
          resultDiv.appendChild(createErrorP("Kunne ikke finne byen."));
          resultDiv.classList.add("show");
        }
      })
      .catch((error) => {
        console.error("Feil ved henting av geokodingsdata:", error);
        const resultDiv = document.getElementById("result");
        resultDiv.innerHTML = "";
        resultDiv.appendChild(
          createErrorP("En feil oppstod ved henting av data.")
        );
        resultDiv.classList.add("show");
      });
  });

function getSunriseSunsetData(lat, lon) {
  const date = new Date().toISOString().split("T")[0];
  const offset = "+01:00";
  const url = `https://api.met.no/weatherapi/sunrise/3.0/sun?lat=${lat}&lon=${lon}&date=${date}&offset=${offset}`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP-feil! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Soloppgang/Solnedgang API respons:", data);
      const resultDiv = document.getElementById("result");

      if (
        data.properties &&
        data.properties.sunrise &&
        data.properties.sunset
      ) {
        const sunrise = data.properties.sunrise.time;
        const sunset = data.properties.sunset.time;

        const dateInfoDiv = createInfoDiv("date-info", [
          `Dato: ${date}`,
          `Soloppgang: ${new Date(sunrise).toLocaleTimeString("no-NO", {
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          `Solnedgang: ${new Date(sunset).toLocaleTimeString("no-NO", {
            hour: "2-digit",
            minute: "2-digit",
          })}`,
        ]);

        resultDiv.appendChild(dateInfoDiv);
        resultDiv.classList.add("show");
      } else {
        resultDiv.appendChild(
          createErrorP("Kunne ikke hente soloppgang/solnedgang data.")
        );
        resultDiv.classList.add("show");
      }
    })
    .catch((error) => {
      console.error("Feil ved henting av soloppgang/solnedgang data:", error);
      const resultDiv = document.getElementById("result");
      resultDiv.innerHTML = "";
      resultDiv.appendChild(
        createErrorP("En feil oppstod ved henting av data.")
      );
      resultDiv.classList.add("show");
    });
}

function createInfoDiv(id, texts) {
  const div = document.createElement("div");
  div.id = id;
  texts.forEach((text) => {
    const p = document.createElement("p");
    p.textContent = text;
    div.appendChild(p);
  });
  return div;
}

function createErrorP(text) {
  const p = document.createElement("p");
  p.textContent = text;
  return p;
}
