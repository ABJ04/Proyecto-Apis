const input = document.getElementById("input");
const select = document.getElementById("moneda");
const button = document.getElementById("button");
const res = document.getElementById("res");
const error = document.getElementById("error");
const chartContainer = document.getElementById("chartContainer");

const historyData = {
  labels: [],
  datasets: [
    {
      label: "Valor de la moneda",
      data: [],
      borderColor: "black",
      fill: false,
    },
  ],
};

const chartConfig = {
  type: "line",
  data: historyData,
  options: {
    responsive: true,
    maintainAspectRatio: false,
  },
};

const selectMoneda = async (moneda) => {
  try {
    const valores = await fetch(`https://mindicador.cl/api/${moneda}`);
    if (!valores.ok) {
      throw Error(`No llegó la data status: ${valores.status}`);
    }
    const res = await valores.json();
    console.log(res);
    const serie = res.serie.slice(0, 10);
    historyData.labels = serie.map((entry) => entry.fecha);
    historyData.datasets[0].data = serie.map((entry) => entry.valor);

    if (chart) {
      chart.update();
    }

    return res;
  } catch (error) {
    alert(error.message || "Ocurrió un error");
  }
};

const selectValor = async () => {
  const data = await selectMoneda("dolar");
  if (data) {
    select.innerHTML += `<option value="dolar">${data.nombre}</option>`;
  }

  const dataUF = await selectMoneda("uf");
  if (dataUF) {
    select.innerHTML += `<option value="uf">${dataUF.nombre}</option>`;
  }

  const dataEuro = await selectMoneda("euro");
  if (dataEuro) {
    select.innerHTML += `<option value="euro">${dataEuro.nombre}</option>`;
  }
};

selectValor();

let chart;
button.addEventListener("click", async () => {
  const monedaSeleccionada = select.value;
  const cantidadCLP = parseFloat(input.value);

  if (isNaN(cantidadCLP)) {
    res.innerHTML = "Por favor, ingresa una cantidad válida en pesos chilenos.";
    return;
  }

  const monedaData = await selectMoneda(monedaSeleccionada);

  if (monedaData) {
    const valorMonedaOrigen = monedaData.serie[0].valor;

    const conversion = cantidadCLP / valorMonedaOrigen;

    res.innerHTML = `$ ${conversion.toFixed(2)} 
    `;
  }
});

const ctx = chartContainer.getContext("2d");
chart = new Chart(ctx, chartConfig);
