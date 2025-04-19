document.addEventListener("DOMContentLoaded", () => {
    const tabla = document.querySelector("#tabla tbody"); //Selecciona el componente id tabla
    const form = document.querySelector("#formulario-credito"); //Y este hace lo debido con el form
    const ctx = document.getElementById('grafico').getContext('2d'); //html Grafico
    //Variables para el uso del id del regsitro a editar y del chart.js
    let editId = null;
    let chart = null;

    const datosGrafico = (labels, montos) => {
        if (chart) {
            // Comprobar datos
            chart.data.labels = labels;
            chart.data.datasets[0].data = montos;
            chart.update();
        } else {
            // Añadir y crear en chart si no hay datos
            chart = new Chart(ctx, {
                type: 'doughnut', //Tipo de grafica de dona
                data: {//Datos de la grafica
                    labels: labels,
                    datasets: [{
                        label: 'Monto Total',
                        data: montos
                    }]
                },
                options: {//Opciones de la grafica
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

    const cargarCreditos = async () => {//Se llama a la API GET para obetener los datos
        const res = await fetch("/api/creditos");
        const data = await res.json();
        tabla.innerHTML = "";
        data.forEach(c => {//Se llena la tabla HTML con los datos
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
        const agrupado = data.reduce((acc, c) => {//Se otiene los nombres de clientes para las labels
            acc[c.cliente] = (acc[c.cliente] || 0) + parseFloat(c.monto);//Se hace un arreglo de clientes y sus montos
            return acc;
        }, {});
    
        const labels = Object.keys(agrupado);
        const montos = labels.map(cliente => agrupado[cliente]);

        datosGrafico(labels, montos); //Se pasan a la funcion para graficarse los datos
    };

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const jsonData = Object.fromEntries(formData.entries());
    
        if (editId) {//Detecta si existe en el arreglo de guardado un id, lo cual indica que se trata de una actualizacion
            await fetch(`/api/creditos/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(jsonData),
            });
            editId = null;
            form.querySelector("button[type='submit']").textContent = "Guardar";
        } else {//Trata la llamada a la api como un POST, osea un nuevo registro
            await fetch("/api/creditos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(jsonData),
            });
        }
    
        form.reset();
        cargarCreditos();//Actualiza la tabla
    });
    

    window.eliminar = async (id) => {//Llama a la API delete para eliminar el resgitro usando el id de este
        await fetch(`/api/creditos/${id}`, { method: "DELETE" });
        cargarCreditos();//Actualiza la tabla
    };

    window.editar = (id, cliente, monto, interes, plazo, fecha) => {
        form.cliente.value = cliente;//Añade en el form los datos del registro a actualizar
        form.monto.value = monto;
        form.tasa_interes.value = interes;
        form.plazo.value = plazo;
        form.fecha_otorgamiento.value = fecha;
        editId = id;//ingresa el id para confirmar una edicion y no un nuevo registro
    };    

    cargarCreditos();//Actualizar tabla
});
