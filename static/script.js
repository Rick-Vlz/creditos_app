document.addEventListener("DOMContentLoaded", () => {
    const tabla = document.querySelector("#tabla tbody"); //Selecciona el componente id tabla
    const form = document.querySelector("#formulario-credito"); //Y este hace lo debido con el form
    const ctx = document.getElementById('grafico').getContext('2d'); //html Grafico
    //Variables para el uso del id del regsitro a editar y del chart.js
    let editId = null;
    let chart = null;

    const crearOActualizarGrafico = (labels, montos) => {
        if (chart) {
            // Comprobar datos
            chart.data.labels = labels;
            chart.data.datasets[0].data = montos;
            chart.update();
        } else {
            // Añadir y crear en chart si no hay datos
            chart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Monto Total',
                        data: montos
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            labels: {
                                color: 'white'
                            }
                        }
                    }
                }
            });
        }
    };

    const cargarCreditos = async () => {
        const res = await fetch("/api/creditos");
        const data = await res.json();
        tabla.innerHTML = "";
        data.forEach(c => {
            tabla.innerHTML += `
                <tr>
                    <td>${c.cliente}</td>
                    <td>$${c.monto}</td>
                    <td>${c.tasa_interes}% Anual</td>
                    <td>${c.plazo} meses</td>
                    <td>${c.fecha_otorgamiento}</td>
                    <td>
                        <button onclick="editar(${c.id}, '${c.cliente}', ${c.monto}, ${c.tasa_interes}, ${c.plazo}, '${c.fecha_otorgamiento}')">Editar</button>
                        <button onclick="eliminar(${c.id})">Eliminar</button>
                    </td>
                </tr>
            `;
        });
        const agrupado = data.reduce((acc, c) => {
            acc[c.cliente] = (acc[c.cliente] || 0) + parseFloat(c.monto);
            return acc;
        }, {});
    
        const labels = Object.keys(agrupado);
        const montos = labels.map(cliente => agrupado[cliente]);

        crearOActualizarGrafico(labels, montos);
    };

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const jsonData = Object.fromEntries(formData.entries());
    
        if (editId) {
            await fetch(`/api/creditos/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(jsonData),
            });
            editId = null;
            form.querySelector("button[type='submit']").textContent = "Guardar";
        } else {
            await fetch("/api/creditos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(jsonData),
            });
        }
    
        form.reset();
        cargarCreditos();
    });
    

    window.eliminar = async (id) => {
        await fetch(`/api/creditos/${id}`, { method: "DELETE" });
        cargarCreditos();
    };

    window.editar = (id, cliente, monto, interes, plazo, fecha) => {
        form.cliente.value = cliente;
        form.monto.value = monto;
        form.tasa_interes.value = interes;
        form.plazo.value = plazo;
        form.fecha_otorgamiento.value = fecha;
        editId = id;
    };    

    cargarCreditos();
});
