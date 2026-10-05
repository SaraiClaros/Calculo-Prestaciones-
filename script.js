/* ==========================================================
   SUPABASE
========================================================== */

const SUPABASE_URL =
    "https://jsigzhopcdlreblorjhe.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_270tyeyHmNZnVfSMUkt-DA_DqCxn4fY";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


let ultimoCalculo = null;

let contadorHorasExtras = 0;


/* ==========================================================
   SALARIOS MÍNIMOS
========================================================== */

const salariosMinimos = {

    comercio: 408.80,

    industria: 408.80,

    maquila: 402.32,

    agropecuario: 272.53

};


/* ==========================================================
   UTILIDADES
========================================================== */

function dinero(valor) {

    return new Intl.NumberFormat(
        "es-SV",
        {
            style: "currency",
            currency: "USD"
        }
    ).format(Number(valor) || 0);

}


function numero(valor) {

    return Number(valor) || 0;

}


function redondear(valor) {

    return Math.round(
        (Number(valor) + Number.EPSILON) * 100
    ) / 100;

}


function obtenerFecha(fecha) {

    if (!fecha) {

        return null;

    }

    const partes = fecha.split("-");

    return new Date(
        Number(partes[0]),
        Number(partes[1]) - 1,
        Number(partes[2])
    );

}

function configurarFechas() {

    const fechaInicio =
        document.getElementById("fecha-inicio");

    const fechaFin =
        document.getElementById("fecha-fin");

    // Fecha máxima para el inicio:
    // 10 días antes de hoy
    const hoy = new Date();

    hoy.setDate(
        hoy.getDate() - 10
    );

    const maxFechaInicio =
        hoy.toISOString().split("T")[0];

    fechaInicio.setAttribute(
        "max",
        maxFechaInicio
    );


    // Al inicio, la fecha final está deshabilitada
    fechaFin.disabled = true;


    // Cuando se seleccione una fecha de inicio
    fechaInicio.addEventListener(
        "change",
        function () {

            if (fechaInicio.value) {

                // La fecha final debe ser posterior
                // a la fecha de inicio
                const fecha = new Date(
                    fechaInicio.value + "T00:00:00"
                );

                fecha.setDate(
                    fecha.getDate() + 1
                );

                const fechaMinimaFin =
                    fecha.toISOString().split("T")[0];

                fechaFin.disabled = false;

                fechaFin.setAttribute(
                    "min",
                    fechaMinimaFin
                );

                // Si ya había una fecha final
                // y ahora es inválida, se elimina
                if (
                    fechaFin.value &&
                    fechaFin.value < fechaMinimaFin
                ) {

                    fechaFin.value = "";

                }

            } else {

                // Si se borra la fecha de inicio,
                // vuelve a bloquearse la fecha final
                fechaFin.value = "";

                fechaFin.disabled = true;

                fechaFin.removeAttribute(
                    "min"
                );

            }

        }
    );

}


document.addEventListener(
    "DOMContentLoaded",
    configurarFechas
);
/* ==========================================================
   ANTIGÜEDAD
========================================================== */

function calcularTiempoAntiguedad() {

    const fechaInicio =
        document.getElementById(
            "fecha-inicio"
        ).value;


    const fechaFin =
        document.getElementById(
            "fecha-fin"
        ).value;


    if (!fechaInicio || !fechaFin) {

        return;

    }


    const inicio =
        obtenerFecha(fechaInicio);


    const fin =
        obtenerFecha(fechaFin);


    if (fin < inicio) {

        alert(
            "La fecha de terminación no puede ser anterior a la fecha de ingreso."
        );

        return;

    }


    let anos =
        fin.getFullYear() -
        inicio.getFullYear();


    let meses =
        fin.getMonth() -
        inicio.getMonth();


    let dias =
        fin.getDate() -
        inicio.getDate();


    if (dias < 0) {

        meses--;

        const ultimoDiaMesAnterior =
            new Date(
                fin.getFullYear(),
                fin.getMonth(),
                0
            ).getDate();

        dias += ultimoDiaMesAnterior;

    }


    if (meses < 0) {

        anos--;

        meses += 12;

    }


    document.getElementById(
        "anos"
    ).value = anos;


    document.getElementById(
        "meses"
    ).value = meses;


    document.getElementById(
        "dias"
    ).value = dias;


    verificarElegibilidadRenuncia();


    /*
       NUEVO:
       Determinar automáticamente el tipo
       de aguinaldo.
    */

    determinarTipoAguinaldo();

}


/* ==========================================================
   TIEMPO TOTAL EN AÑOS
========================================================== */

function obtenerTiempoTotal() {

    const anos =
        numero(
            document.getElementById(
                "anos"
            ).value
        );


    const meses =
        numero(
            document.getElementById(
                "meses"
            ).value
        );


    const dias =
        numero(
            document.getElementById(
                "dias"
            ).value
        );


    return (
        anos +
        meses / 12 +
        dias / 365
    );

}


/* ==========================================================
   TOPE
========================================================== */

function actualizarTope() {

    const sector =
        document.getElementById(
            "sector"
        ).value;


    const salarioMinimo =
        salariosMinimos[sector];


    const tope =
        salarioMinimo * 4;


    const elementoTope =
        document.getElementById(
            "tope-indemnizacion"
        );


    if (elementoTope) {

        elementoTope.innerHTML =
            `Tope de referencia para indemnización:
            <strong>${dinero(tope)}</strong>
            mensuales.`;

    }


    const salario =
        numero(
            document.getElementById(
                "salario"
            ).value
        );


    const alerta =
        document.getElementById(
            "salario-alerta"
        );


    if (!alerta) {

        return;

    }


    if (
        salario > 0 &&
        salario < salarioMinimo
    ) {

        alerta.classList.remove(
            "hidden"
        );


        alerta.innerHTML =
            `⚠ ALERTA: El salario ingresado
            (${dinero(salario)})
            está por debajo del salario mínimo seleccionado
            (${dinero(salarioMinimo)}).`;

    } else {

        alerta.classList.add(
            "hidden"
        );

        alerta.innerHTML = "";

    }

}


/* ==========================================================
   RENUNCIA
========================================================== */

function toggleRenunciaBox() {

    const causaSeleccionada =
        document.querySelector(
            'input[name="causa"]:checked'
        );


    if (!causaSeleccionada) {

        return;

    }


    const causa =
        causaSeleccionada.value;


    const caja =
        document.getElementById(
            "renuncia-box"
        );


    if (!caja) {

        return;

    }


    if (causa === "renuncia") {

        caja.classList.remove(
            "hidden"
        );

        verificarElegibilidadRenuncia();

    } else {

        caja.classList.add(
            "hidden"
        );

    }

}


function updatePreavisoText() {

    const tipoCargo =
        document.getElementById(
            "cargo-tipo"
        ).value;


    const info =
        document.getElementById(
            "preaviso-info"
        );


    if (!info) {

        return;

    }


    if (tipoCargo === "jefatura") {

        info.textContent =
            "ℹ Requisito: Notificar con 30 días de anticipación para cargos de jefatura, gerencia o dirección.";

    } else {

        info.textContent =
            "ℹ Requisito: Notificar con 15 días de anticipación para cargos operativos.";

    }


    verificarElegibilidadRenuncia();

}


function verificarElegibilidadRenuncia() {

    const causaSeleccionada =
        document.querySelector(
            'input[name="causa"]:checked'
        );


    if (!causaSeleccionada) {

        return;

    }


    const causa =
        causaSeleccionada.value;


    if (causa !== "renuncia") {

        return;

    }


    const anos =
        numero(
            document.getElementById(
                "anos"
            ).value
        );


    const preaviso =
        document.getElementById(
            "preaviso"
        ).value;


    const tipoCargo =
        document.getElementById(
            "cargo-tipo"
        ).value;


    const diasPreaviso =
        tipoCargo === "jefatura"
            ? 30
            : 15;


    const estado =
        document.getElementById(
            "renuncia-estado"
        );


    if (!estado) {

        return;

    }


    if (anos < 2) {

        estado.className =
            "renuncia-estado error";


        estado.textContent =
            "⚠ No cumple con la antigüedad mínima de 2 años indicada para la prestación económica por renuncia.";

        return;

    }


    if (preaviso !== "si") {

        estado.className =
            "renuncia-estado warning";


        estado.textContent =
            `⚠ No se acredita el preaviso de ${diasPreaviso} días requerido para este tipo de cargo.`;

        return;

    }


    estado.className =
        "renuncia-estado ok";


    estado.textContent =
        `✓ Los datos ingresados cumplen la verificación de ${diasPreaviso} días de preaviso y antigüedad mínima.`;

}


/* ==========================================================
   AGUINALDO
   NUEVA FUNCIONALIDAD AUTOMÁTICA
========================================================== */

/*
   En la reforma aprobada en 2026:

   - El aguinaldo puede pagarse desde el 1 de octubre.
   - La fecha de referencia para determinar
     el cálculo proporcional es el 12 de diciembre.
   - Si el trabajador ya cumple el período
     correspondiente, se determina como completo.
   - Si no lo cumple, se calcula proporcional.
*/


function determinarTipoAguinaldo() {

    const fechaInicioElemento =
        document.getElementById(
            "fecha-inicio"
        );


    const fechaFinElemento =
        document.getElementById(
            "fecha-fin"
        );


    if (
        !fechaInicioElemento ||
        !fechaFinElemento
    ) {

        return;

    }


    const fechaInicio =
        fechaInicioElemento.value;


    const fechaFin =
        fechaFinElemento.value;


    if (
        !fechaInicio ||
        !fechaFin
    ) {

        return;

    }


    const inicio =
        obtenerFecha(fechaInicio);


    const fin =
        obtenerFecha(fechaFin);


    if (
        !inicio ||
        !fin ||
        fin < inicio
    ) {

        return;

    }


    /*
       El período de referencia del aguinaldo
       termina el 12 de diciembre.
    */

    const fechaReferencia =
        new Date(
            fin.getFullYear(),
            11,
            12
        );


    /*
       Para determinar si el trabajador
       completó el período correspondiente,
       se verifica que haya ingresado
       a más tardar el 12 de diciembre
       del año anterior.
    */

    const inicioPeriodo =
        new Date(
            fin.getFullYear() - 1,
            11,
            12
        );


    let tipo;


    if (
        inicio <= inicioPeriodo &&
        fin >= fechaReferencia
    ) {

        tipo = "completo";

    } else {

        tipo = "proporcional";

    }


    /*
       Actualizar radios si existen.
    */

    const radioCompleto =
        document.querySelector(
            'input[name="aguinaldo_tipo"][value="completo"], input[name="aguinaldo_tipo"][value="completas"]'
        );


    const radioProporcional =
        document.querySelector(
            'input[name="aguinaldo_tipo"][value="proporcional"]'
        );


    if (radioCompleto) {

        radioCompleto.checked =
            tipo === "completo";

    }


    if (radioProporcional) {

        radioProporcional.checked =
            tipo === "proporcional";

    }


    /*
       Mostrar información al usuario.
    */

    let indicador =
        document.getElementById(
            "aguinaldo-automatico"
        );


    if (!indicador) {

        const radio =
            document.querySelector(
                'input[name="aguinaldo_tipo"]'
            );


        if (radio) {

            const contenedor =
                radio.closest(
                    ".form-group, .radio-group, .section-block"
                );


            if (contenedor) {

                indicador =
                    document.createElement(
                        "div"
                    );

                indicador.id =
                    "aguinaldo-automatico";

                indicador.className =
                    "calculation-preview";

                contenedor.appendChild(
                    indicador
                );

            }

        }

    }


    if (indicador) {

        if (tipo === "completo") {

            indicador.innerHTML =
                "✓ <strong>Aguinaldo completo:</strong> las fechas ingresadas indican que se cumple el período de referencia.";

        } else {

            indicador.innerHTML =
                "ℹ <strong>Aguinaldo proporcional:</strong> las fechas ingresadas indican que no se completa el período de referencia.";

        }

    }

}


/* ==========================================================
   VACACIONES
========================================================== */

function toggleVacacionesFechas() {

    const seleccion =
        document.querySelector(
            'input[name="vacaciones_tipo"]:checked'
        );


    if (!seleccion) {

        return;

    }


    const tipo =
        seleccion.value;


    const caja =
        document.getElementById(
            "vacaciones-fechas-box"
        );


    if (!caja) {

        return;

    }


    /*
       Se conserva la lógica original.
    */

    caja.classList.remove(
        "hidden"
    );

}


/* ==========================================================
   ASUETOS
========================================================== */

function toggleAsuetos() {

    const seleccion =
        document.querySelector(
            'input[name="laboro_asueto"]:checked'
        );


    if (!seleccion) {

        return;

    }


    const opcion =
        seleccion.value;


    const caja =
        document.getElementById(
            "asuetos-box"
        );


    if (!caja) {

        return;

    }


    if (opcion === "si") {

        caja.classList.remove(
            "hidden"
        );

    } else {

        caja.classList.add(
            "hidden"
        );


        document
            .querySelectorAll(
                ".asueto-check"
            )
            .forEach(
                checkbox => {

                    checkbox.checked =
                        false;

                }
            );

    }

}

/* ==========================================================
   DÍAS DE DESCANSO SEMANAL LABORADOS
========================================================== */

function toggleDescansoSemanal() {

    const seleccion = document.querySelector(
        'input[name="laboro_descanso"]:checked'
    );

    if (!seleccion) return;

    const caja = document.getElementById(
        "descanso-semanal-box"
    );

    if (!caja) return;

    if (seleccion.value === "si") {

        caja.classList.remove("hidden");

        actualizarDescansoSemanalPreview();

    } else {

        caja.classList.add("hidden");

        const input = document.getElementById(
            "dias-descanso-semanal"
        );

        if (input) {
            input.value = 0;
        }

        const preview = document.getElementById(
            "descanso-semanal-preview"
        );

        if (preview) {
            preview.textContent =
                "Ingrese la cantidad de días para calcular el monto.";
        }
    }
}


function calcularDescansoSemanal(salario) {

    const seleccion = document.querySelector(
        'input[name="laboro_descanso"]:checked'
    );

    if (!seleccion || seleccion.value !== "si") {
        return {
            cantidad: 0,
            monto: 0
        };
    }

    const input = document.getElementById(
        "dias-descanso-semanal"
    );

    const cantidad = Math.max(
        0,
        Math.floor(Number(input?.value) || 0)
    );

    if (cantidad === 0 || salario <= 0) {
        return {
            cantidad: cantidad,
            monto: 0
        };
    }

    const salarioDiario = salario / 30;

    /*
     * Art. 175 del Código de Trabajo:
     * trabajo realizado en día de descanso semanal
     * = salario básico del día + mínimo 50% adicional.
     */
    const monto =
        salarioDiario * 1.50 * cantidad;

    return {
        cantidad: cantidad,
        monto: redondear(monto)
    };
}


function actualizarDescansoSemanalPreview() {

    const salario = numero(
        document.getElementById("salario")?.value
    );

    const dias = Math.max(
        0,
        Math.floor(
            Number(
                document.getElementById(
                    "dias-descanso-semanal"
                )?.value
            ) || 0
        )
    );

    const preview = document.getElementById(
        "descanso-semanal-preview"
    );

    if (!preview) return;

    if (dias === 0 || salario <= 0) {

        preview.textContent =
            "Ingrese la cantidad de días para calcular el monto.";

        return;
    }

    const salarioDiario = salario / 30;

    const monto =
        salarioDiario * 1.50 * dias;

    preview.textContent =
        `${dias} día(s) de descanso semanal laborado(s) × ` +
        `${dinero(salarioDiario)} × 1.50 = ` +
        `${dinero(monto)}`;
}


/* ==========================================================
   HORAS EXTRAS
========================================================== */

function toggleHorasExtras() {

    const seleccion =
        document.querySelector(
            'input[name="tiene_extras"]:checked'
        );


    if (!seleccion) {

        return;

    }


    const opcion =
        seleccion.value;


    const caja =
        document.getElementById(
            "extras-box"
        );


    if (!caja) {

        return;

    }


    if (opcion === "si") {

        caja.classList.remove(
            "hidden"
        );


        if (
            document.querySelectorAll(
                ".extra-row"
            ).length === 0
        ) {

            agregarHoraExtra();

        }

    } else {

        caja.classList.add(
            "hidden"
        );


        const container =
            document.getElementById(
                "extras-container"
            );


        if (container) {

            container.innerHTML = "";

        }


        contadorHorasExtras = 0;

    }

}


/* ==========================================================
   PARSEAR HORA ESCRITA
========================================================== */

/*
   Acepta ejemplos como:

   8:00 AM
   08:00 AM
   8 AM
   8:30 PM
   11:45 PM

   También acepta:

   08:00
   20:00

   Pero la interfaz está pensada
   principalmente para AM / PM.
*/

function convertirHora(hora) {

    if (!hora) {

        return null;

    }


    let texto =
        String(hora)
            .trim()
            .toUpperCase()
            .replace(/\./g, "");


    /*
       Detectar AM / PM
    */

    let periodo = null;


    if (
        texto.endsWith("AM")
    ) {

        periodo = "AM";

        texto =
            texto
                .slice(0, -2)
                .trim();

    } else if (
        texto.endsWith("PM")
    ) {

        periodo = "PM";

        texto =
            texto
                .slice(0, -2)
                .trim();

    }


    /*
       Separar horas y minutos.
    */

    let horas;
    let minutos;


    if (
        texto.includes(":")
    ) {

        const partes =
            texto.split(":");


        horas =
            Number(
                partes[0]
            );


        minutos =
            Number(
                partes[1]
            );

    } else {

        horas =
            Number(texto);

        minutos = 0;

    }


    if (
        !Number.isFinite(horas) ||
        !Number.isFinite(minutos)
    ) {

        return null;

    }


    /*
       Validar minutos.
    */

    if (
        minutos < 0 ||
        minutos > 59
    ) {

        return null;

    }


    /*
       Si se escribió AM / PM.
    */

    if (periodo === "AM") {

        if (horas === 12) {

            horas = 0;

        }

    } else if (
        periodo === "PM"
    ) {

        if (horas !== 12) {

            horas += 12;

        }

    }


    /*
       Si no escribió AM / PM,
       aceptar formato de 24 horas.
    */

    if (
        periodo === null &&
        (horas < 0 || horas > 23)
    ) {

        return null;

    }


    if (
        horas < 0 ||
        horas > 23
    ) {

        return null;

    }


    return (
        horas +
        minutos / 60
    );

}


/* ==========================================================
   FORMATEAR HORA
========================================================== */

function formatearHora(hora) {

    const valor =
        convertirHora(hora);


    if (
        valor === null
    ) {

        return "";

    }


    let horas =
        Math.floor(valor);


    const minutos =
        Math.round(
            (valor - horas) * 60
        );


    const periodo =
        horas >= 12
            ? "PM"
            : "AM";


    let horas12 =
        horas % 12;


    if (horas12 === 0) {

        horas12 = 12;

    }


    return (
        String(horas12) +
        ":" +
        String(minutos).padStart(2, "0") +
        " " +
        periodo
    );

}


/* ==========================================================
   DETERMINAR SI ES HORARIO NOCTURNO
========================================================== */

/*
   Jornada nocturna:
   desde las 7:00 PM hasta antes de las 6:00 AM.
*/

function esHoraNocturna(hora) {

    const valor =
        typeof hora === "number"
            ? hora
            : convertirHora(hora);


    if (
        valor === null
    ) {

        return false;

    }


    return (
        valor >= 19 ||
        valor < 6
    );

}


/* ==========================================================
   DETERMINAR TIPO DE JORNADA
========================================================== */

function determinarTipoJornada(
    inicio,
    fin
) {

    const horaInicio =
        convertirHora(inicio);


    const horaFin =
        convertirHora(fin);


    if (
        horaInicio === null ||
        horaFin === null
    ) {

        return null;

    }


    /*
       Si el intervalo cruza la noche,
       se considera nocturno.

       Ejemplo:
       6:00 PM - 10:00 PM
    */

    if (
        esHoraNocturna(horaInicio) ||
        esHoraNocturna(horaFin)
    ) {

        return "nocturna";

    }


    return "diurna";

}


/* ==========================================================
   AGREGAR HORA EXTRA
========================================================== */

function agregarHoraExtra() {

    contadorHorasExtras++;


    const id =
        contadorHorasExtras;


    const container =
        document.getElementById(
            "extras-container"
        );


    if (!container) {

        return;

    }


    const fila =
        document.createElement(
            "div"
        );


    fila.className =
        "extra-row";


    fila.dataset.id =
        id;


    fila.innerHTML = `

        <div class="extra-grid">

            <div class="extra-field">

                <label>
                    Fecha del turno
                </label>

                <input
                    type="date"
                    class="extra-fecha"
                    onchange="actualizarFilaExtra(this)"
                >

            </div>


            <div class="extra-field">

                <label>
                    Hora de Inicio
                </label>

                <input
                    type="text"
                    class="extra-inicio"
                    placeholder="Ej. 8:00 AM"
                    autocomplete="off"
                    oninput="actualizarFilaExtra(this)"
                    onchange="actualizarFilaExtra(this)"
                >

            </div>


            <div class="extra-field">

                <label>
                    Hora de Fin
                </label>

                <input
                    type="text"
                    class="extra-fin"
                    placeholder="Ej. 5:00 PM"
                    autocomplete="off"
                    oninput="actualizarFilaExtra(this)"
                    onchange="actualizarFilaExtra(this)"
                >

            </div>

        </div>


        <div class="extra-result">
            Escriba la hora de inicio y final con AM o PM para determinar automáticamente si corresponde a horario diurno o nocturno.
        </div>


        <button
            type="button"
            class="btn-remove-extra"
            onclick="this.parentElement.remove()"
        >
            Eliminar
        </button>

    `;


    container.appendChild(
        fila
    );

}


/* ==========================================================
   ACTUALIZAR HORA EXTRA
========================================================== */

function actualizarFilaExtra(elemento) {

    const fila =
        elemento.closest(
            ".extra-row"
        );


    if (!fila) {

        return;

    }


    const inicio =
        fila.querySelector(
            ".extra-inicio"
        ).value;


    const fin =
        fila.querySelector(
            ".extra-fin"
        ).value;


    const resultado =
        fila.querySelector(
            ".extra-result"
        );


    if (
        !inicio ||
        !fin
    ) {

        resultado.textContent =
            "Complete la hora de inicio y final.";

        return;

    }


    const horaInicio =
        convertirHora(inicio);


    const horaFinOriginal =
        convertirHora(fin);


    if (
        horaInicio === null ||
        horaFinOriginal === null
    ) {

        resultado.innerHTML =
            "⚠ Formato inválido. Ejemplo: <strong>8:00 AM</strong> o <strong>10:30 PM</strong>.";

        return;

    }


    let horaFin =
        horaFinOriginal;


    /*
       Si termina al día siguiente.
    */

    if (
        horaFin <= horaInicio
    ) {

        horaFin += 24;

    }


    const horas =
        horaFin -
        horaInicio;


    if (
        horas <= 0
    ) {

        resultado.textContent =
            "Horario inválido.";

        return;

    }


    /*
       Determinar si el período toca
       horario nocturno.
    */

    let nocturna = false;


    /*
       Revisar cada fracción de hora
       del intervalo.
    */

    const minutosTotales =
        Math.ceil(
            horas * 60
        );


    for (
        let minuto = 0;
        minuto <= minutosTotales;
        minuto += 30
    ) {

        const momento =
            (
                horaInicio +
                minuto / 60
            ) % 24;


        if (
            esHoraNocturna(momento)
        ) {

            nocturna = true;

            break;

        }

    }


    const tipo =
        nocturna
            ? "Hora Extra Nocturna"
            : "Hora Extra Diurna";


    if (nocturna) {

        resultado.innerHTML =
            `<strong>${tipo}</strong> —
            ${horas.toFixed(2)} horas —
            Se detectó horario nocturno.`;

    } else {

        resultado.innerHTML =
            `<strong>${tipo}</strong> —
            ${horas.toFixed(2)} horas —
            Se detectó horario diurno.`;

    }

}


/* ==========================================================
   CALCULAR HORAS EXTRAS
========================================================== */

function calcularHorasExtras(
    salario
) {

    let total = 0;

    const registros = [];


    document
        .querySelectorAll(
            ".extra-row"
        )
        .forEach(
            fila => {

                const fecha =
                    fila.querySelector(
                        ".extra-fecha"
                    )?.value;


                const inicio =
                    fila.querySelector(
                        ".extra-inicio"
                    )?.value;


                const fin =
                    fila.querySelector(
                        ".extra-fin"
                    )?.value;


                if (
                    !fecha ||
                    !inicio ||
                    !fin
                ) {

                    return;

                }


                const horaInicio =
                    convertirHora(
                        inicio
                    );


                const horaFinOriginal =
                    convertirHora(
                        fin
                    );


                if (
                    horaInicio === null ||
                    horaFinOriginal === null
                ) {

                    return;

                }


                let horaFin =
                    horaFinOriginal;


                if (
                    horaFin <= horaInicio
                ) {

                    horaFin += 24;

                }


                const horas =
                    horaFin -
                    horaInicio;


                if (
                    horas <= 0
                ) {

                    return;

                }


                /*
                   Determinar si alguna parte
                   del período cae en horario nocturno.
                */

                let nocturna = false;


                const minutosTotales =
                    Math.ceil(
                        horas * 60
                    );


                for (
                    let minuto = 0;
                    minuto <= minutosTotales;
                    minuto += 30
                ) {

                    const momento =
                        (
                            horaInicio +
                            minuto / 60
                        ) % 24;


                    if (
                        esHoraNocturna(
                            momento
                        )
                    ) {

                        nocturna = true;

                        break;

                    }

                }


                /*
                   Multiplicadores originales
                   conservados.
                */

                const multiplicador =
                    nocturna
                        ? 2.25
                        : 2.00;


                /*
                   Salario mensual / 30 / 8
                   = valor de hora ordinaria.
                */

                const valorHora =
                    salario /
                    30 /
                    8;


                const monto =
                    valorHora *
                    horas *
                    multiplicador;


                total += monto;


                registros.push({

                    fecha,

                    inicio,

                    fin,

                    inicioFormateado:
                        formatearHora(
                            inicio
                        ),

                    finFormateado:
                        formatearHora(
                            fin
                        ),

                    horas,

                    tipo:
                        nocturna
                            ? "Hora Extra Nocturna"
                            : "Hora Extra Diurna",

                    jornada:
                        nocturna
                            ? "Nocturna"
                            : "Diurna",

                    monto

                });

            }
        );


    return {

        total:
            redondear(total),

        registros

    };

}


/* ==========================================================
   INDEMNIZACIÓN
========================================================== */

function calcularIndemnizacion(
    salario,
    tiempo,
    causa,
    sector
) {

    const minimo =
        salariosMinimos[
            sector
        ];


    const tope =
        minimo * 4;


    /*
       DESPIDO
    */

    if (
        causa === "despido"
    ) {

        const salarioComputable =
            Math.min(
                salario,
                tope
            );


        const salarioDiario =
            salarioComputable /
            30;


        const monto =
            salarioDiario *
            30 *
            tiempo;


        return {

            monto:
                redondear(monto),

            salarioComputable,

            tope,

            excede:
                salario > tope

        };

    }


    /*
       RENUNCIA
    */

    const anos =
        numero(
            document.getElementById(
                "anos"
            ).value
        );


    const preaviso =
        document.getElementById(
            "preaviso"
        ).value;

if (
        tiempo < 2
    ) {

        return {

            monto: 0,

            salarioComputable: 0,

            tope,

            excede: false

        };

    }


    const salarioComputable =
        Math.min(
            salario,
            tope * 2
        );


    const salarioDiario =
        salarioComputable /
        30;


    const monto =
        salarioDiario *
        15 *
        tiempo;


    return {

        monto:
            redondear(monto),

        salarioComputable,

        tope,

        excede:
            salario > tope * 2

    };

}


/* ==========================================================
   ISR
========================================================== */

function calcularISR(
    monto
) {

    let isr = 0;


    if (
        monto <= 472
    ) {

        isr = 0;

    } else if (
        monto <= 895.24
    ) {

        isr =
            (monto - 472) *
            0.10 +
            17.67;

    } else if (
        monto <= 2038.10
    ) {

        isr =
            (monto - 895.24) *
            0.20 +
            60;

    } else {

        isr =
            (monto - 2038.10) *
            0.30 +
            288.57;

    }


    return Math.max(
        0,
        redondear(isr)
    );

}


/* ==========================================================
   AGUINALDO
========================================================== */

function calcularAguinaldo(
    salario,
    tiempo,
    fechaFin
) {

    const fecha = obtenerFecha(fechaFin);

    if (!fecha) {
        return 0;
    }

    /*
       Días de aguinaldo según antigüedad:

       1 año y menos de 3 años = 15 días
       3 años y menos de 10 años = 19 días
       10 años o más = 21 días
    */

    const anos = Math.floor(tiempo);

    let diasBase;

    if (anos >= 10) {
        diasBase = 21;
    } else if (anos >= 3) {
        diasBase = 19;
    } else {
        diasBase = 15;
    }

    const salarioDiario = salario / 30;

    /*
       Obtener la modalidad seleccionada.
    */

    const radio = document.querySelector(
        'input[name="aguinaldo_tipo"]:checked'
    );

    let tipo = radio ? radio.value : null;

    /*
       Si no se seleccionó una modalidad,
       determinarla automáticamente.
    */

    if (!tipo) {

        const fechaInicioInput =
            document.getElementById("fecha-inicio").value;

        const fechaInicio =
            obtenerFecha(fechaInicioInput);

        if (!fechaInicio) {
            return 0;
        }

        /*
           El período de referencia del aguinaldo
           comprende del 12 de diciembre al 11 de diciembre
           del año siguiente.
        */

        let inicioPeriodo;
        let finPeriodo;

        if (
            fecha.getMonth() > 11 ||
            (
                fecha.getMonth() === 11 &&
                fecha.getDate() >= 12
            )
        ) {

            inicioPeriodo = new Date(
                fecha.getFullYear(),
                11,
                12
            );

            finPeriodo = new Date(
                fecha.getFullYear() + 1,
                11,
                11
            );

        } else {

            inicioPeriodo = new Date(
                fecha.getFullYear() - 1,
                11,
                12
            );

            finPeriodo = new Date(
                fecha.getFullYear(),
                11,
                11
            );
        }

        /*
           Si ya completó el período correspondiente,
           se considera aguinaldo completo.
        */

        if (
            fechaInicio <= inicioPeriodo &&
            fecha >= finPeriodo
        ) {

            tipo = "completo";

        } else {

            tipo = "proporcional";
        }
    }

    /*
       AGUINALDO COMPLETO
    */

    if (tipo === "completo") {

        return redondear(
            salarioDiario * diasBase
        );
    }

    /*
       AGUINALDO PROPORCIONAL
       
       Para una terminación antes del 12 de diciembre,
       el período inicia el 12 de diciembre anterior.
    */

    let inicioPeriodo;

    if (
        fecha.getMonth() < 11 ||
        (
            fecha.getMonth() === 11 &&
            fecha.getDate() < 12
        )
    ) {

        inicioPeriodo = new Date(
            fecha.getFullYear() - 1,
            11,
            12
        );

    } else {

        inicioPeriodo = new Date(
            fecha.getFullYear(),
            11,
            12
        );
    }

    /*
       Si el trabajador ingresó después del inicio
       del período, se toma como inicio su fecha de ingreso.
    */

    const fechaInicioInput =
        document.getElementById("fecha-inicio").value;

    const fechaInicio =
        obtenerFecha(fechaInicioInput);

    if (
        fechaInicio &&
        fechaInicio > inicioPeriodo
    ) {

        inicioPeriodo = fechaInicio;
    }

    /*
       Días laborados dentro del período de aguinaldo.
    */

    const dias = Math.max(
        0,
        Math.floor(
            (
                fecha -
                inicioPeriodo
            ) / 86400000
        ) + 1
    );

    /*
       Aguinaldo proporcional:
       
       salario diario × días de aguinaldo
       × días laborados / 365
    */

    return redondear(
        salarioDiario *
        diasBase *
        dias /
        365
    );
}



/* ==========================================================
   VACACIONES
========================================================== */

function calcularVacaciones(
    salario
) {

    const radio =
        document.querySelector(
            'input[name="vacaciones_tipo"]:checked'
        );


    if (!radio) {

        return {

            dias: 0,

            base: 0,

            recargo: 0,

            monto: 0

        };

    }


    const tipo =
        radio.value;


    const salarioDiario =
        salario / 30;


    /*
       15 días + 30%
    */

    if (
        tipo === "completas"
    ) {

        const base =
            salarioDiario *
            15;


        const recargo =
            base * 0.30;


        return {

            dias: 15,

            base:
                redondear(base),

            recargo:
                redondear(recargo),

            monto:
                redondear(
                    base +
                    recargo
                )

        };

    }


    const meses =
        numero(
            document.getElementById(
                "meses-vacaciones-pendientes"
            ).value
        );


    const dias =
        (15 / 12) *
        meses;


    const base =
        salarioDiario *
        dias;


    const recargo =
        base * 0.30;


    return {

        dias:
            redondear(dias),

        base:
            redondear(base),

        recargo:
            redondear(recargo),

        monto:
            redondear(
                base +
                recargo
            )

    };

}


/* ==========================================================
   ASUETOS
========================================================== */

function calcularAsuetos(
    salario
) {

    const radio =
        document.querySelector(
            'input[name="laboro_asueto"]:checked'
        );


    if (!radio) {

        return {

            cantidad: 0,

            monto: 0,

            dias: []

        };

    }


    const opcion =
        radio.value;


    if (
        opcion !== "si"
    ) {

        return {

            cantidad: 0,

            monto: 0,

            dias: []

        };

    }


    const seleccionados =
        Array.from(
            document.querySelectorAll(
                ".asueto-check:checked"
            )
        );


    const salarioDiario =
        salario / 30;


    /*
       Pago del día + 100% de recargo.
    */

    const montoPorDia =
        salarioDiario * 2;


    return {

        cantidad:
            seleccionados.length,

        monto:
            redondear(
                seleccionados.length *
                montoPorDia
            ),

        dias:
            seleccionados.map(
                item =>
                    item.dataset.nombre
            )

    };

}


/* ==========================================================
   DEDUCCIONES
========================================================== */

function calcularDeducciones(
    base,
    aplicar
) {

    if (!aplicar) {

        return {

            isss: 0,

            afp: 0,

            isr: 0,

            total: 0

        };

    }


    /*
       ISSS trabajador:
       3% con techo de $1,000
    */

    const baseISSS =
        Math.min(
            Math.max(
                base,
                0
            ),
            1000
        );


    const isss =
        baseISSS * 0.03;


    /*
       AFP trabajador:
       7.25%
    */

    const afp =
        Math.max(
            base,
            0
        ) * 0.0725;


    /*
       ISR
    */

    const baseISR =
        Math.max(
            0,
            base -
            isss -
            afp
        );


    const isr =
        calcularISR(
            baseISR
        );


    return {

        isss:
            redondear(isss),

        afp:
            redondear(afp),

        isr,

        total:
            redondear(
                isss +
                afp +
                isr
            )

    };

}


/* ==========================================================
   NÚMERO A LETRAS
========================================================== */

function numeroALetras(
    numero
) {

    numero =
        redondear(numero);


    const entero =
        Math.floor(
            numero
        );


    const centavos =
        Math.round(
            (
                numero -
                entero
            ) * 100
        );


    const unidades = [

        "",

        "UNO",

        "DOS",

        "TRES",

        "CUATRO",

        "CINCO",

        "SEIS",

        "SIETE",

        "OCHO",

        "NUEVE",

        "DIEZ",

        "ONCE",

        "DOCE",

        "TRECE",

        "CATORCE",

        "QUINCE",

        "DIECISÉIS",

        "DIECISIETE",

        "DIECIOCHO",

        "DIECINUEVE",

        "VEINTE"

    ];


    const decenas = [

        "",

        "",

        "VEINTE",

        "TREINTA",

        "CUARENTA",

        "CINCUENTA",

        "SESENTA",

        "SETENTA",

        "OCHENTA",

        "NOVENTA"

    ];


    function menor100(n) {

        if (
            n <= 20
        ) {

            return unidades[n];

        }


        if (
            n < 30
        ) {

            return (
                "VEINTI" +
                unidades[
                    n - 20
                ].toLowerCase()
            );

        }


        const d =
            Math.floor(
                n / 10
            );


        const u =
            n % 10;


        return (
            decenas[d] +
            (
                u
                    ? " Y " +
                      unidades[u]
                    : ""
            )
        );

    }


    function menor1000(n) {

        if (
            n < 100
        ) {

            return menor100(n);

        }


        if (
            n === 100
        ) {

            return "CIEN";

        }


        const centenas = [

            "",

            "CIENTO",

            "DOSCIENTOS",

            "TRESCIENTOS",

            "CUATROCIENTOS",

            "QUINIENTOS",

            "SEISCIENTOS",

            "SETECIENTOS",

            "OCHOCIENTOS",

            "NOVECIENTOS"

        ];


        const c =
            Math.floor(
                n / 100
            );


        const resto =
            n % 100;


        return (
            centenas[c] +
            (
                resto
                    ? " " +
                      menor100(resto)
                    : ""
            )
        );

    }


    function convertir(n) {

        if (
            n === 0
        ) {

            return "CERO";

        }


        if (
            n < 1000
        ) {

            return menor1000(n);

        }


        if (
            n < 1000000
        ) {

            const miles =
                Math.floor(
                    n / 1000
                );


            const resto =
                n % 1000;


            let texto =
                miles === 1
                    ? "MIL"
                    : convertir(miles) +
                      " MIL";


            if (
                resto
            ) {

                texto +=
                    " " +
                    menor1000(
                        resto
                    );

            }


            return texto;

        }


        const millones =
            Math.floor(
                n / 1000000
            );


        const resto =
            n % 1000000;


        let texto =
            millones === 1
                ? "UN MILLÓN"
                : convertir(millones) +
                  " MILLONES";


        if (
            resto
        ) {

            texto +=
                " " +
                convertir(
                    resto
                );

        }


        return texto;

    }


    return (
        convertir(entero) +
        " CON " +
        String(
            centavos
        ).padStart(
            2,
            "0"
        ) +
        "/100 DÓLARES DE LOS ESTADOS UNIDOS DE AMÉRICA"
    );

}


/* ==========================================================
   FORMATO FECHA
========================================================== */

function formatDate(
    dateStr
) {

    if (!dateStr) {

        return "";

    }


    const fecha =
        obtenerFecha(
            dateStr
        );


    return fecha.toLocaleDateString(
        "es-SV",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


/* ==========================================================
   CÁLCULO PRINCIPAL
========================================================== */

function calculateLiquidacion(
    event
) {

    if (event) {

        event.preventDefault();

    }


    const salario =
        numero(
            document.getElementById(
                "salario"
            ).value
        );


    const fechaInicio =
        document.getElementById(
            "fecha-inicio"
        ).value;


    const fechaFin =
        document.getElementById(
            "fecha-fin"
        ).value;


    if (
        !fechaInicio ||
        !fechaFin
    ) {

        alert(
            "Complete las fechas de inicio y terminación."
        );

        return;

    }


    const inicio =
        obtenerFecha(
            fechaInicio
        );


    const fin =
        obtenerFecha(
            fechaFin
        );


    if (
        fin < inicio
    ) {

        alert(
            "La fecha de terminación no puede ser anterior a la fecha de ingreso."
        );

        return;

    }


    calcularTiempoAntiguedad();


    /*
       Determinar automáticamente
       el tipo de aguinaldo.
    */

    determinarTipoAguinaldo();


    const anos =
        numero(
            document.getElementById(
                "anos"
            ).value
        );


    const meses =
        numero(
            document.getElementById(
                "meses"
            ).value
        );


    const dias =
        numero(
            document.getElementById(
                "dias"
            ).value
        );


    const tiempo =
        anos +
        meses / 12 +
        dias / 365;


    const causaElemento =
        document.querySelector(
            'input[name="causa"]:checked'
        );


    const causa =
        causaElemento
            ? causaElemento.value
            : "despido";


    const sector =
        document.getElementById(
            "sector"
        ).value;


    /* =====================================================
       INDEMNIZACIÓN
    ====================================================== */

    const indemnizacion =
        calcularIndemnizacion(
            salario,
            tiempo,
            causa,
            sector
        );


    /* =====================================================
       AGUINALDO
    ====================================================== */

    const aguinaldo =
        calcularAguinaldo(
            salario,
            tiempo,
            fechaFin
        );


    /* =====================================================
       VACACIONES
    ====================================================== */

    const vacaciones =
        calcularVacaciones(
            salario
        );


    /* =====================================================
       ASUETOS
    ====================================================== */

    const asuetos =
        calcularAsuetos(
            salario
        );


    /* =====================================================
       DÍAS DE DESCANSO SEMANAL LABORADOS
    ====================================================== */

    const descansoSemanal =
        calcularDescansoSemanal(
            salario
        );


    /* =====================================================
       HORAS EXTRAS
    ====================================================== */

    const horasExtras =
        calcularHorasExtras(
            salario
        );


    /* =====================================================
       TOTAL BRUTO
    ====================================================== */

    const totalBruto =
        redondear(

            indemnizacion.monto +

            aguinaldo +

            vacaciones.monto +

            asuetos.monto +

            descansoSemanal.monto +

            horasExtras.total

        );


    /* =====================================================
       BASE COTIZABLE
    ====================================================== */

    const baseCotizable =
        redondear(

            aguinaldo +

            vacaciones.monto +

            asuetos.monto +

            descansoSemanal.monto +

            horasExtras.total

        );


    /* =====================================================
       DEDUCCIONES
    ====================================================== */

    const checkboxDeducciones =
        document.getElementById(
            "aplicar-deducciones"
        );


    const aplicarDeducciones =
        checkboxDeducciones
            ? checkboxDeducciones.checked
            : false;


    const deducciones =
        calcularDeducciones(
            baseCotizable,
            aplicarDeducciones
        );


    /* =====================================================
       NETO
    ====================================================== */

    const neto =
        redondear(
            totalBruto -
            deducciones.total
        );


    /* =====================================================
       TIPO DE AGUINALDO
    ====================================================== */

    const radioAguinaldo =
        document.querySelector(
            'input[name="aguinaldo_tipo"]:checked'
        );


    const tipoAguinaldo =
        radioAguinaldo
            ? radioAguinaldo.value
            : "proporcional";


    /* =====================================================
       GUARDAR RESULTADO
    ====================================================== */

    ultimoCalculo = {

        trabajador:
            document.getElementById(
                "nombre-trabajador"
            ).value,

        cargo:
            document.getElementById(
                "cargo-desempenado"
            ).value,

        patrono:
            document.getElementById(
                "nombre-patrono"
            ).value,

    

        salario,

        sector,

        fechaInicio,

        fechaFin,

        anos,

        meses,

        dias,

        causa,

        tipoAguinaldo,

        indemnizacion:
            indemnizacion.monto,

        salarioComputable:
            indemnizacion.salarioComputable,

        topeIndemnizacion:
            indemnizacion.tope,

        aguinaldo,

        vacaciones:
            vacaciones.monto,

        vacacionesBase:
            vacaciones.base,

        vacacionesRecargo:
            vacaciones.recargo,

        asuetos:
            asuetos.monto,

        asuetosDias:
            asuetos.dias,

        descansoSemanal:
            descansoSemanal.monto,

        descansoSemanalCantidad:
            descansoSemanal.cantidad,

        horasExtras:
            horasExtras.total,

        registrosHorasExtras:
            horasExtras.registros,

        baseCotizable,

        isss:
            deducciones.isss,

        afp:
            deducciones.afp,

        isr:
            deducciones.isr,

        totalDeducciones:
            deducciones.total,

        totalBruto,

        neto,

        montoLetras:
            numeroALetras(
                neto
            )

    };


    mostrarResultado();

}


/* ==========================================================
   MOSTRAR RESULTADO
========================================================== */

function mostrarResultado() {

    const data =
        ultimoCalculo;


    const resultCard =
        document.getElementById(
            "result-card"
        );


    const resultDetails =
        document.getElementById(
            "result-details"
        );


    if (
        !resultCard ||
        !resultDetails
    ) {

        return;

    }


    const textoTipoAguinaldo =
        data.tipoAguinaldo === "completo"
            ? "Completo"
            : "Proporcional";


    resultDetails.innerHTML = `

        <div class="result-section">

            <h4>
                Datos del Trabajador
            </h4>


            <div class="result-line">

                <span>
                    Trabajador
                </span>

                <strong>
                    ${data.trabajador}
                </strong>

            </div>


            <div class="result-line">

                <span>
                    Patrono / Empresa
                </span>

                <strong>
                    ${data.patrono}
                </strong>

            </div>


            <div class="result-line">

                <span>
                    Salario mensual
                </span>

                <strong>
                    ${dinero(data.salario)}
                </strong>

            </div>


            <div class="result-line">

                <span>
                    Período
                </span>

                <strong>
                    ${formatDate(data.fechaInicio)}
                    -
                    ${formatDate(data.fechaFin)}
                </strong>

            </div>


            <div class="result-line">

                <span>
                    Tiempo laborado
                </span>

                <strong>
                    ${data.anos} años,
                    ${data.meses} meses,
                    ${data.dias} días
                </strong>

            </div>

        </div>


        <div class="result-section">

            <h4>
                Desglose de Prestaciones
            </h4>


            <div class="result-line">

                <span>
                    Indemnización
                </span>

                <strong>
                    ${dinero(data.indemnizacion)}
                </strong>

            </div>


            <div class="result-line">

                <span>
                    Aguinaldo
                    (${textoTipoAguinaldo})
                </span>

                <strong>
                    ${dinero(data.aguinaldo)}
                </strong>

            </div>


            <div class="result-line">

                <span>
                    Vacaciones + 30%
                </span>

                <strong>
                    ${dinero(data.vacaciones)}
                </strong>

            </div>


            <div class="result-line">

                <span>
                    Días de asueto
                </span>

                <strong>
                    ${dinero(data.asuetos)}
                </strong>

            </div>


            <div class="result-line">

                <span>
                    Días de descanso semanal laborados
                    (${data.descansoSemanalCantidad || 0} día(s))
                </span>

                <strong>
                    ${dinero(data.descansoSemanal || 0)}
                </strong>

            </div>


            <div class="result-line">

                <span>
                    Horas extras / nocturnidad
                </span>

                <strong>
                    ${dinero(data.horasExtras)}
                </strong>

            </div>


            <div class="result-line total">

                <span>
                    TOTAL BRUTO
                </span>

                <strong>
                    ${dinero(data.totalBruto)}
                </strong>

            </div>

        </div>


        <div class="result-section">

            <h4>
                Deducciones Legales
            </h4>


            <div class="result-line">

                <span>
                    ISSS
                </span>

                <strong>
                    - ${dinero(data.isss)}
                </strong>

            </div>


            <div class="result-line">

                <span>
                    AFP
                </span>

                <strong>
                    - ${dinero(data.afp)}
                </strong>

            </div>


            <div class="result-line">

                <span>
                    ISR
                </span>

                <strong>
                    - ${dinero(data.isr)}
                </strong>

            </div>


            <div class="result-line">

                <span>
                    Total deducciones
                </span>

                <strong>
                    - ${dinero(data.totalDeducciones)}
                </strong>

            </div>


            <div class="result-line neto">

                <span>
                    MONTO NETO A RECIBIR
                </span>

                <strong>
                    ${dinero(data.neto)}
                </strong>

            </div>


            <div class="letras-resultado">

                <strong>
                    Monto en letras:
                </strong>

                <br>

                ${data.montoLetras}

            </div>

        </div>

    `;


    mostrarAlertas();


    resultCard.classList.remove(
        "hidden"
    );


    resultCard.scrollIntoView({
        behavior: "smooth"
    });

}


/* ==========================================================
   ALERTAS
========================================================== */

function mostrarAlertas() {

    const data =
        ultimoCalculo;


    const contenedor =
        document.getElementById(
            "alertas"
        );


    if (!contenedor) {

        return;

    }


    const alertas = [];


    const minimo =
        salariosMinimos[
            data.sector
        ];


    /*
       SALARIO MÍNIMO
    */

    if (
        data.salario <
        minimo
    ) {

        alertas.push({

            tipo:
                "warning",

            texto:
                `ALERTA: El salario registrado (${dinero(data.salario)}) está por debajo del salario mínimo seleccionado (${dinero(minimo)}).`

        });

    }


    /*
       TOPE
    */

    if (
        data.salario >
        data.topeIndemnizacion
    ) {

        alertas.push({

            tipo:
                "warning",

            texto:
                `ALERTA: El salario supera el tope de referencia de indemnización (${dinero(data.topeIndemnizacion)}). Se utilizó el salario computable correspondiente al límite.`

        });

    }


    /*
       RENUNCIA
    */

    if (
        data.causa === "renuncia" &&
        data.indemnizacion === 0
    ) {

        alertas.push({

            tipo:
                "warning",

            texto:
                "ALERTA: La prestación económica por renuncia no fue incluida con los datos proporcionados."

        });

    }


    /*
       AGUINALDO
    */

    if (
        data.tipoAguinaldo === "proporcional"
    ) {

        alertas.push({

            tipo:
                "success",

            texto:
                "Aguinaldo calculado automáticamente como proporcional según las fechas ingresadas."

        });

    } else {

        alertas.push({

            tipo:
                "success",

            texto:
                "Aguinaldo calculado automáticamente como completo según las fechas ingresadas."

        });

    }


    /*
       ASUETOS
    */

    if (
        data.asuetosDias.length > 0
    ) {

        alertas.push({

            tipo:
                "success",

            texto:
                `Se seleccionaron ${data.asuetosDias.length} día(s) de asueto para el cálculo.`

        });

    }


    /*
       DÍAS DE DESCANSO SEMANAL
    */

    if (
        data.descansoSemanalCantidad > 0
    ) {

        alertas.push({

            tipo:
                "success",

            texto:
                `Se registraron ${data.descansoSemanalCantidad} día(s) de descanso semanal laborado(s) para el cálculo.`

        });

    }


    /*
       HORAS EXTRAS
    */

    if (
        data.registrosHorasExtras.length > 0
    ) {

        alertas.push({

            tipo:
                "success",

            texto:
                `Se registraron ${data.registrosHorasExtras.length} período(s) de horas extras.`

        });

    }


    if (
        alertas.length === 0
    ) {

        contenedor.innerHTML = `

            <div class="alert-item alert-success">

                ✓ No se generaron alertas
                con los datos ingresados.

            </div>

        `;

        return;

    }


    contenedor.innerHTML =
        alertas
            .map(
                alerta => `

                    <div
                        class="alert-item
                        alert-${alerta.tipo}"
                    >

                        ${alerta.texto}

                    </div>

                `
            )
            .join("");

}


/* ==========================================================
   GUARDAR EN SUPABASE
========================================================== */

async function guardarCalculoSupabase() {

    if (!ultimoCalculo) {

        return;

    }


    /*
       Se conserva Supabase.
       No se modifica la estructura de
       tu base de datos.
    */

}


/* ==========================================================
   GENERAR PDF
========================================================== */

function generarPDF() {

    if (!ultimoCalculo) {

        alert(
            "Primero debes realizar el cálculo."
        );

        return;

    }


    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {

        alert(
            "No se pudo cargar jsPDF."
        );

        return;

    }


    const {
        jsPDF
    } =
        window.jspdf;


    const doc =
        new jsPDF();


    const data =
        ultimoCalculo;


    const azul =
        [26, 27, 79];


    let y =
        20;


    /*
       ENCABEZADO
    */

    doc.setFillColor(
        azul[0],
        azul[1],
        azul[2]
    );


    doc.rect(
        0,
        0,
        210,
        28,
        "F"
    );


    doc.setTextColor(
        255,
        255,
        255
    );


    doc.setFontSize(
        13
    );


    doc.text(
        "COMPROBANTE DE LIQUIDACIÓN DE PRESTACIONES LABORALES",
        105,
        11,
        {
            align: "center"
        }
    );


    doc.setFontSize(
        9
    );


    doc.text(
        "República de El Salvador",
        105,
        19,
        {
            align: "center"
        }
    );


    doc.setTextColor(
        0,
        0,
        0
    );


    y = 40;


    /*
       DATOS
    */

    doc.setFontSize(
        11
    );


    doc.setFont(undefined, "bold");


    doc.text(
        "I. DATOS DE LAS PARTES",
        15,
        y
    );


    doc.setFont(undefined, "normal");


    y += 8;


    doc.setFontSize(
        9
    );


    doc.text(
        `Trabajador: ${data.trabajador}`,
        15,
        y
    );


    y += 6;




    doc.text(
        `Cargo: ${data.cargo}`,
        15,
        y
    );


    y += 6;


    doc.text(
        `Patrono / Empresa: ${data.patrono}`,
        15,
        y
    );


    y += 6;


    doc.text(
        `Salario mensual: ${dinero(data.salario)}`,
        15,
        y
    );


    y += 6;


    doc.text(
        `Inicio: ${formatDate(data.fechaInicio)}`,
        15,
        y
    );


    y += 6;


    doc.text(
        `Terminación: ${formatDate(data.fechaFin)}`,
        15,
        y
    );


    y += 6;


    doc.text(
        `Antigüedad: ${data.anos} años, ${data.meses} meses, ${data.dias} días`,
        15,
        y
    );


    y += 13;


    /*
       PRESTACIONES
    */

    doc.setFont(undefined, "bold");


    doc.text(
        "II. DESGLOSE DE PRESTACIONES",
        15,
        y
    );


    doc.setFont(undefined, "normal");


    y += 8;


    const filas = [

        [
            "Indemnización",
            dinero(data.indemnizacion)
        ],

        [
            `Aguinaldo (${data.tipoAguinaldo === "completo" ? "Completo" : "Proporcional"})`,
            dinero(data.aguinaldo)
        ],

        [
            "Vacaciones + 30%",
            dinero(data.vacaciones)
        ],

        [
            "Días de asueto",
            dinero(data.asuetos)
        ],

        [
            "Días de descanso semanal laborados (Arts. 175 y 176 CT)",
            dinero(data.descansoSemanal || 0)
        ],

        [
            "Horas extras / nocturnidad",
            dinero(data.horasExtras)
        ],

        [
            "TOTAL BRUTO",
            dinero(data.totalBruto)
        ]

    ];


    filas.forEach(
        fila => {

            doc.text(
                fila[0],
                20,
                y
            );


            doc.text(
                fila[1],
                190,
                y,
                {
                    align: "right"
                }
            );


            y += 7;

        }
    );


    y += 7;


    /*
       DEDUCCIONES
    */

    doc.setFont(undefined, "bold");


    doc.text(
        "III. DEDUCCIONES LEGALES",
        15,
        y
    );


    doc.setFont(undefined, "normal");


    y += 8;


    const deduccionesPDF = [

        [
            "ISSS",
            dinero(data.isss)
        ],

        [
            "AFP",
            dinero(data.afp)
        ],

        [
            "ISR",
            dinero(data.isr)
        ],

        [
            "TOTAL DEDUCCIONES",
            dinero(data.totalDeducciones)
        ]

    ];


    deduccionesPDF.forEach(
        fila => {

            doc.text(
                fila[0],
                20,
                y
            );


            doc.text(
                fila[1],
                190,
                y,
                {
                    align: "right"
                }
            );


            y += 7;

        }
    );


    y += 7;


    doc.setFont(undefined, "bold");


    doc.setFontSize(
        12
    );


    doc.text(
        "MONTO NETO A RECIBIR",
        20,
        y
    );


    doc.text(
        dinero(data.neto),
        190,
        y,
        {
            align: "right"
        }
    );


    y += 10;


    doc.setFontSize(
        9
    );


    doc.setFont(undefined, "normal");


    doc.text(
        "Monto en letras:",
        20,
        y
    );


    y += 6;


    const textoLetras =
        doc.splitTextToSize(
            data.montoLetras,
            165
        );


    doc.text(
        textoLetras,
        20,
        y
    );


    y +=
        textoLetras.length *
        5 +
        10;


    /*
       ASUETOS
    */

    if (
        data.asuetosDias.length > 0
    ) {

        doc.setFont(undefined, "bold");


        doc.text(
            "Días de asueto seleccionados:",
            20,
            y
        );


        y += 6;


        doc.setFont(undefined, "normal");


        data.asuetosDias.forEach(
            dia => {

                if (
                    y > 270
                ) {

                    doc.addPage();

                    y = 20;

                }


                doc.text(
                    "• " + dia,
                    25,
                    y
                );


                y += 5;

            }
        );

    }


    /*
       DESCANSO SEMANAL
    */

    if (
        data.descansoSemanalCantidad > 0
    ) {

        y += 5;


        if (
            y > 270
        ) {

            doc.addPage();

            y = 20;

        }


        doc.setFont(undefined, "bold");


        doc.text(
            "Días de descanso semanal laborados:",
            20,
            y
        );


        y += 6;


        doc.setFont(undefined, "normal");


        doc.text(
            `Cantidad: ${data.descansoSemanalCantidad} día(s)`,
            25,
            y
        );


        y += 5;


        doc.text(
            "Base: Arts. 175 y 176 del Código de Trabajo.",
            25,
            y
        );


        y += 5;


        doc.text(
            `Monto calculado: ${dinero(data.descansoSemanal)}`,
            25,
            y
        );

    }


    /*
       HORAS EXTRAS
    */

    if (
        data.registrosHorasExtras.length > 0
    ) {

        y += 5;


        doc.setFont(undefined, "bold");


        doc.text(
            "Horas extras registradas:",
            20,
            y
        );


        y += 6;


        doc.setFont(undefined, "normal");


        data.registrosHorasExtras.forEach(
            registro => {

                if (
                    y > 270
                ) {

                    doc.addPage();

                    y = 20;

                }


                const texto =
                    `${registro.fecha} ${registro.inicio}-${registro.fin} — ${registro.tipo} — ${registro.horas.toFixed(2)} h — ${dinero(registro.monto)}`;


                const lineas =
                    doc.splitTextToSize(
                        texto,
                        170
                    );


                doc.text(
                    lineas,
                    20,
                    y
                );


                y +=
                    lineas.length *
                    5;

            }
        );

    }


    /*
       PIE
    */

    doc.setFontSize(
        8
    );


    doc.text(
        "Documento generado mediante Calculadora de Prestaciones Laborales.",
        105,
        285,
        {
            align: "center"
        }
    );


    doc.text(
        "Página 1/2",
        190,
        292,
        {
            align: "right"
        }
    );


    /*
       PÁGINA 2
    */

    doc.addPage();


    doc.setFillColor(
        azul[0],
        azul[1],
        azul[2]
    );


    doc.rect(
        0,
        0,
        210,
        25,
        "F"
    );


    doc.setTextColor(
        255,
        255,
        255
    );


    doc.setFontSize(
        12
    );


    doc.text(
        "DECLARACIÓN Y CONSTANCIA",
        105,
        13,
        {
            align: "center"
        }
    );


    doc.setTextColor(
        0,
        0,
        0
    );


    doc.setFontSize(
        9
    );


    y = 40;


    doc.setFont(undefined, "bold");


    doc.text(
        "IV. DECLARACIÓN",
        15,
        y
    );


    doc.setFont(undefined, "normal");


    y += 10;


    const declaracion =
        "El presente documento contiene un cálculo informativo de las prestaciones laborales correspondientes a los datos proporcionados por las partes. Los resultados deben ser verificados conforme a la legislación laboral vigente y las circunstancias particulares de la relación laboral.";


    const textoDeclaracion =
        doc.splitTextToSize(
            declaracion,
            175
        );


    doc.text(
        textoDeclaracion,
        15,
        y
    );


    y +=
        textoDeclaracion.length *
        5 +
        20;


    /*
       FIRMAS
    */

    doc.setFont(undefined, "bold");


    doc.text(
        "TRABAJADOR(A)",
        25,
        y
    );


    doc.text(
        "PATRONO / REPRESENTANTE",
        120,
        y
    );


    doc.setFont(undefined, "normal");


    y += 18;


    doc.line(
        20,
        y,
        90,
        y
    );


    doc.line(
        120,
        y,
        190,
        y
    );


    y += 6;


    doc.text(
        data.trabajador || "Trabajador(a)",
        55,
        y,
        {
            align: "center"
        }
    );


    doc.text(
        data.patrono || "Patrono / Representante",
        155,
        y,
        {
            align: "center"
        }
    );


    y += 5;


    doc.setFontSize(
        8
    );


    doc.text(
        `DUI: ${data.duiTrabajador || "________________"}`,
        55,
        y,
        {
            align: "center"
        }
    );


    doc.text(
        "Firma",
        155,
        y,
        {
            align: "center"
        }
    );


    y += 35;


    /*
       TESTIGOS
    */

    doc.setFontSize(
        9
    );


    doc.setFont(undefined, "bold");


    doc.text(
        "TESTIGO / CONSTANCIA ADICIONAL",
        15,
        y
    );


    doc.setFont(undefined, "normal");


    y += 18;


    doc.line(
        20,
        y,
        90,
        y
    );


    doc.line(
        120,
        y,
        190,
        y
    );


    y += 6;


    doc.text(
        "Nombre y firma",
        55,
        y,
        {
            align: "center"
        }
    );


    doc.text(
        "Nombre y firma",
        155,
        y,
        {
            align: "center"
        }
    );


    y += 30;


    /*
       OBSERVACIÓN
    */

    doc.setFont(undefined, "bold");


    doc.text(
        "OBSERVACIÓN",
        15,
        y
    );


    doc.setFont(undefined, "normal");


    y += 8;


    const observacion =
        "Este comprobante constituye una constancia de los datos y del cálculo realizado por el sistema. No sustituye la revisión de la autoridad laboral competente ni la documentación que pueda acreditar conceptos adicionales.";


    const textoObservacion =
        doc.splitTextToSize(
            observacion,
            175
        );


    doc.text(
        textoObservacion,
        15,
        y
    );


    y +=
        textoObservacion.length *
        5 +
        15;


    doc.text(
        `Generado: ${new Date().toLocaleString("es-SV")}`,
        15,
        y
    );


    doc.text(
        "Página 2/2",
        190,
        292,
        {
            align: "right"
        }
    );


    /*
       NOMBRE DEL ARCHIVO
    */

    const nombre =
        (data.trabajador || "trabajador")
            .replace(
                /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g,
                ""
            )
            .trim()
            .replace(
                /\s+/g,
                "_"
            );


    doc.save(
        `Liquidacion_${nombre}.pdf`
    );

}


/* ==========================================================
   COMPROBANTE DE FIRMA
========================================================== */

/*
   Esta función genera un documento
   independiente exclusivamente para
   dejar constancia y obtener firmas.
*/

function generarComprobanteFirma() {

    if (!ultimoCalculo) {

        alert(
            "Primero debes realizar el cálculo de la liquidación."
        );

        return;

    }


    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {

        alert(
            "No se pudo cargar jsPDF."
        );

        return;

    }


    const {
        jsPDF
    } =
        window.jspdf;


    const data =
        ultimoCalculo;


    const doc =
        new jsPDF();


    const azul =
        [26, 27, 79];


    let y =
        20;


    /*
       ENCABEZADO
    */

    doc.setFillColor(
        azul[0],
        azul[1],
        azul[2]
    );


    doc.rect(
        0,
        0,
        210,
        30,
        "F"
    );


    doc.setTextColor(
        255,
        255,
        255
    );


    doc.setFontSize(
        14
    );


    doc.setFont(undefined, "bold");


    doc.text(
        "COMPROBANTE DE FIRMA",
        105,
        12,
        {
            align: "center"
        }
    );


    doc.setFontSize(
        9
    );


    doc.setFont(undefined, "normal");


    doc.text(
        "LIQUIDACIÓN DE PRESTACIONES LABORALES",
        105,
        21,
        {
            align: "center"
        }
    );


    doc.setTextColor(
        0,
        0,
        0
    );


    y =
        43;


    /*
       DATOS
    */

    doc.setFontSize(
        10
    );


    doc.setFont(undefined, "bold");


    doc.text(
        "I. IDENTIFICACIÓN DE LAS PARTES",
        15,
        y
    );


    doc.setFont(undefined, "normal");


    y += 9;


    doc.text(
        `Trabajador(a): ${data.trabajador || ""}`,
        15,
        y
    );


    y += 7;


    doc.text(
        `DUI del trabajador: ${data.duiTrabajador || ""}`,
        15,
        y
    );


    y += 7;


    doc.text(
        `Cargo desempeñado: ${data.cargo || ""}`,
        15,
        y
    );


    y += 7;


    doc.text(
        `Patrono / Empresa: ${data.patrono || ""}`,
        15,
        y
    );


    y += 7;


    doc.text(
        `DUI del patrono / representante: ${data.duiPatrono || ""}`,
        15,
        y
    );


    y += 13;


    /*
       PERÍODO
    */

    doc.setFont(undefined, "bold");


    doc.text(
        "II. PERÍODO LABORAL",
        15,
        y
    );


    doc.setFont(undefined, "normal");


    y += 8;


    doc.text(
        `Fecha de inicio: ${formatDate(data.fechaInicio)}`,
        15,
        y
    );


    y += 7;


    doc.text(
        `Fecha de terminación: ${formatDate(data.fechaFin)}`,
        15,
        y
    );


    y += 7;


    doc.text(
        `Tiempo laborado: ${data.anos} años, ${data.meses} meses, ${data.dias} días`,
        15,
        y
    );


    y += 13;


    /*
       RESUMEN ECONÓMICO
    */

    doc.setFont(undefined, "bold");


    doc.text(
        "III. RESUMEN DE LA LIQUIDACIÓN",
        15,
        y
    );


    doc.setFont(undefined, "normal");


    y += 9;


    const resumen = [

        [
            "Indemnización",
            dinero(data.indemnizacion)
        ],

        [
            `Aguinaldo ${data.tipoAguinaldo === "completo" ? "completo" : "proporcional"}`,
            dinero(data.aguinaldo)
        ],

        [
            "Vacaciones + 30%",
            dinero(data.vacaciones)
        ],

        [
            "Días de asueto",
            dinero(data.asuetos)
        ],

        [
            "Días de descanso semanal laborados",
            dinero(data.descansoSemanal || 0)
        ],

        [
            "Horas extras / nocturnidad",
            dinero(data.horasExtras)
        ],

        [
            "TOTAL BRUTO",
            dinero(data.totalBruto)
        ],

        [
            "Total deducciones",
            dinero(data.totalDeducciones)
        ],

        [
            "MONTO NETO A RECIBIR",
            dinero(data.neto)
        ]

    ];


    resumen.forEach(
        fila => {

            doc.text(
                fila[0],
                20,
                y
            );


            doc.text(
                fila[1],
                190,
                y,
                {
                    align: "right"
                }
            );


            y += 7;

        }
    );


    y += 4;


    /*
       MONTO EN LETRAS
    */

    doc.setFont(undefined, "bold");


    doc.text(
        "Monto neto en letras:",
        20,
        y
    );


    doc.setFont(undefined, "normal");


    y += 6;


    const montoLetras =
        doc.splitTextToSize(
            data.montoLetras,
            170
        );


    doc.text(
        montoLetras,
        20,
        y
    );


    y +=
        montoLetras.length *
        5 +
        14;


    /*
       DECLARACIÓN
    */

    doc.setFont(undefined, "bold");


    doc.text(
        "IV. DECLARACIÓN DE RECEPCIÓN",
        15,
        y
    );


    doc.setFont(undefined, "normal");


    y += 9;


    const declaracion =
        `Yo, ${data.trabajador || "________________________________"}, manifiesto que he recibido la información correspondiente a la liquidación de prestaciones laborales indicada en este documento y que los datos consignados fueron proporcionados para realizar el cálculo.`;


    const textoDeclaracion =
        doc.splitTextToSize(
            declaracion,
            175
        );


    doc.text(
        textoDeclaracion,
        15,
        y
    );


    y +=
        textoDeclaracion.length *
        5 +
        18;


    /*
       FIRMA TRABAJADOR
    */

    doc.setFont(undefined, "bold");


    doc.text(
        "FIRMA DEL TRABAJADOR(A)",
        15,
        y
    );


    doc.text(
        "FIRMA DEL PATRONO / REPRESENTANTE",
        115,
        y
    );


    y += 18;


    doc.line(
        15,
        y,
        90,
        y
    );


    doc.line(
        115,
        y,
        195,
        y
    );


    y += 6;


    doc.setFont(undefined, "normal");


    doc.setFontSize(
        8
    );


    doc.text(
        "Firma",
        52,
        y,
        {
            align: "center"
        }
    );


    doc.text(
        "Firma",
        155,
        y,
        {
            align: "center"
        }
    );


    y += 12;


    doc.text(
        `Nombre: ${data.trabajador || "________________________________"}`,
        15,
        y
    );


    doc.text(
        `Nombre: ${data.patrono || "________________________________"}`,
        115,
        y
    );


    y += 7;


    doc.text(
        `DUI: ${data.duiTrabajador || "________________"}`,
        15,
        y
    );


    doc.text(
        "DUI: __________________",
        115,
        y
    );


    y += 18;


    /*
       FECHA DE FIRMA
    */

    doc.setFontSize(
        9
    );


    doc.setFont(undefined, "bold");


    doc.text(
        "Fecha de firma:",
        15,
        y
    );


    doc.setFont(undefined, "normal");


    doc.line(
        50,
        y + 1,
        110,
        y + 1
    );


    /*
       OBSERVACIÓN
    */

    y += 20;


    doc.setFont(undefined, "bold");


    doc.text(
        "OBSERVACIÓN",
        15,
        y
    );


    doc.setFont(undefined, "normal");


    y += 7;


    const observacion =
        "Este documento deja constancia de la información utilizada para elaborar la liquidación y de la firma de las partes. La firma no sustituye los documentos legales que correspondan ni impide que las partes ejerzan los derechos que la legislación laboral les reconoce.";


    const textoObservacion =
        doc.splitTextToSize(
            observacion,
            175
        );


    doc.text(
        textoObservacion,
        15,
        y
    );


    y +=
        textoObservacion.length *
        5 +
        12;


    doc.setFontSize(
        7
    );


    doc.text(
        `Documento generado: ${new Date().toLocaleString("es-SV")}`,
        15,
        y
    );


    doc.text(
        "Calculadora de Prestaciones Laborales - El Salvador",
        105,
        288,
        {
            align: "center"
        }
    );


    /*
       ARCHIVO
    */

    const nombre =
        (data.trabajador || "trabajador")
            .replace(
                /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g,
                ""
            )
            .trim()
            .replace(
                /\s+/g,
                "_"
            );


    doc.save(
        `Comprobante_Firma_${nombre}.pdf`
    );

}


/* ==========================================================
   LIMPIAR FORMULARIO
========================================================== */

function limpiarFormulario() {

    const formulario =
        document.getElementById(
            "calc-form"
        );


    if (!formulario) {

        return;

    }


    formulario.reset();


    /*
       Limpiar resultados.
    */

    const resultCard =
        document.getElementById(
            "result-card"
        );


    if (resultCard) {

        resultCard.classList.add(
            "hidden"
        );

    }


    const resultDetails =
        document.getElementById(
            "result-details"
        );


    if (resultDetails) {

        resultDetails.innerHTML = "";

    }


    const alertas =
        document.getElementById(
            "alertas"
        );


    if (alertas) {

        alertas.innerHTML = "";

    }


    /*
       Limpiar horas extras.
    */

    const extras =
        document.getElementById(
            "extras-container"
        );


    if (extras) {

        extras.innerHTML = "";

    }


    contadorHorasExtras = 0;


    ultimoCalculo = null;


    /*
       Ocultar cajas condicionales.
    */

    const cajas = [

        "renuncia-box",

        "asuetos-box",

        "descanso-semanal-box"

    ];


    cajas.forEach(
        id => {

            const elemento =
                document.getElementById(
                    id
                );


            if (elemento) {

                elemento.classList.add(
                    "hidden"
                );

            }

        }
    );


    /*
       Actualizar valores iniciales.
    */

    actualizarTope();


    toggleRenunciaBox();


    toggleVacacionesFechas();


    toggleAsuetos();


    toggleHorasExtras();


    toggleDescansoSemanal();


    /*
       Eliminar indicador automático
       de aguinaldo si se creó dinámicamente.
    */

    const indicador =
        document.getElementById(
            "aguinaldo-automatico"
        );


    if (indicador) {

        indicador.remove();

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* ==========================================================
   INICIALIZACIÓN
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        actualizarTope();

        toggleRenunciaBox();

        toggleVacacionesFechas();

        toggleAsuetos();

        toggleHorasExtras();

        toggleDescansoSemanal();


        /*
           SALARIO
        */

        const salario =
            document.getElementById(
                "salario"
            );


        if (salario) {

            salario.addEventListener(
                "input",
                function () {

                    actualizarTope();

                    actualizarDescansoSemanalPreview();

                }
            );

        }


        /*
           SECTOR
        */

        const sector =
            document.getElementById(
                "sector"
            );


        if (sector) {

            sector.addEventListener(
                "change",
                actualizarTope
            );

        }


        /*
           CARGO
        */

        const cargoTipo =
            document.getElementById(
                "cargo-tipo"
            );


        if (cargoTipo) {

            cargoTipo.addEventListener(
                "change",
                updatePreavisoText
            );

        }


        /*
           FECHA DE INICIO
        */

        const fechaInicio =
            document.getElementById(
                "fecha-inicio"
            );


        if (fechaInicio) {

            fechaInicio.addEventListener(
                "change",
                function () {

                    calcularTiempoAntiguedad();

                    determinarTipoAguinaldo();

                }
            );

        }


        /*
           FECHA DE FINALIZACIÓN
        */

        const fechaFin =
            document.getElementById(
                "fecha-fin"
            );


        if (fechaFin) {

            fechaFin.addEventListener(
                "change",
                function () {

                    calcularTiempoAntiguedad();

                    determinarTipoAguinaldo();

                }
            );

        }


        /*
           CAUSA
        */

        document
            .querySelectorAll(
                'input[name="causa"]'
            )
            .forEach(
                radio => {

                    radio.addEventListener(
                        "change",
                        toggleRenunciaBox
                    );

                }
            );


        /*
           PREAVISO
        */

        const preaviso =
            document.getElementById(
                "preaviso"
            );


        if (preaviso) {

            preaviso.addEventListener(
                "change",
                verificarElegibilidadRenuncia
            );

        }


        /*
           AGUINALDO
           Si existen radios manuales,
           los dejamos sincronizados.
        */

        document
            .querySelectorAll(
                'input[name="aguinaldo_tipo"]'
            )
            .forEach(
                radio => {

                    radio.addEventListener(
                        "change",
                        function () {

                            /*
                               El sistema prioriza
                               la determinación automática
                               según las fechas.
                            */

                            determinarTipoAguinaldo();

                        }
                    );

                }
            );


        /*
           VACACIONES
        */

        document
            .querySelectorAll(
                'input[name="vacaciones_tipo"]'
            )
            .forEach(
                radio => {

                    radio.addEventListener(
                        "change",
                        toggleVacacionesFechas
                    );

                }
            );


        /*
           ASUETOS
        */

        document
            .querySelectorAll(
                'input[name="laboro_asueto"]'
            )
            .forEach(
                radio => {

                    radio.addEventListener(
                        "change",
                        toggleAsuetos
                    );

                }
            );


        /*
           DÍAS DE DESCANSO SEMANAL
        */

        document
            .querySelectorAll(
                'input[name="laboro_descanso"]'
            )
            .forEach(
                radio => {

                    radio.addEventListener(
                        "change",
                        toggleDescansoSemanal
                    );

                }
            );


        const diasDescanso =
            document.getElementById(
                "dias-descanso-semanal"
            );


        if (diasDescanso) {

            diasDescanso.addEventListener(
                "input",
                actualizarDescansoSemanalPreview
            );

        }


        /*
           HORAS EXTRAS
        */

        document
            .querySelectorAll(
                'input[name="tiene_extras"]'
            )
            .forEach(
                radio => {

                    radio.addEventListener(
                        "change",
                        toggleHorasExtras
                    );

                }
            );


        /*
           Primera comprobación
           de aguinaldo.
        */

        determinarTipoAguinaldo();

    }
);

