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


    document.getElementById(
        "tope-indemnizacion"
    ).innerHTML =
        `Tope de referencia para indemnización:
        <strong>${dinero(tope)}</strong>
        mensuales.`;



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

    const causa =
        document.querySelector(
            'input[name="causa"]:checked'
        ).value;


    const caja =
        document.getElementById(
            "renuncia-box"
        );


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

    const causa =
        document.querySelector(
            'input[name="causa"]:checked'
        )?.value;


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
   VACACIONES
========================================================== */

function toggleVacacionesFechas() {

    const tipo =
        document.querySelector(
            'input[name="vacaciones_tipo"]:checked'
        ).value;


    const caja =
        document.getElementById(
            "vacaciones-fechas-box"
        );


    if (tipo === "proporcional") {

        caja.classList.remove(
            "hidden"
        );

    } else {

        caja.classList.remove(
            "hidden"
        );

    }

}



/* ==========================================================
   ASUETOS
========================================================== */

function toggleAsuetos() {

    const opcion =
        document.querySelector(
            'input[name="laboro_asueto"]:checked'
        ).value;


    const caja =
        document.getElementById(
            "asuetos-box"
        );


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
                    checkbox.checked = false;
                }
            );

    }

}



/* ==========================================================
   HORAS EXTRAS
========================================================== */

function toggleHorasExtras() {

    const opcion =
        document.querySelector(
            'input[name="tiene_extras"]:checked'
        ).value;


    const caja =
        document.getElementById(
            "extras-box"
        );


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


        document.getElementById(
            "extras-container"
        ).innerHTML = "";

    }

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
                    type="time"
                    class="extra-inicio"
                    onchange="actualizarFilaExtra(this)"
                >

            </div>


            <div class="extra-field">

                <label>
                    Hora de Fin
                </label>

                <input
                    type="time"
                    class="extra-fin"
                    onchange="actualizarFilaExtra(this)"
                >

            </div>

        </div>


        <div class="extra-result">
            Complete los datos para determinar el tipo de hora.
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
   HORARIO NOCTURNO
========================================================== */

function convertirHora(hora) {

    if (!hora) {
        return 0;
    }


    const partes =
        hora.split(":");


    return (
        Number(partes[0]) +
        Number(partes[1]) / 60
    );

}



function esHoraNocturna(hora) {

    const valor =
        convertirHora(hora);


    return (
        valor >= 19 ||
        valor < 6
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


    if (!inicio || !fin) {

        resultado.textContent =
            "Complete el horario para determinar el tipo.";

        return;

    }


    let horaInicio =
        convertirHora(inicio);


    let horaFin =
        convertirHora(fin);


    if (horaFin <= horaInicio) {

        horaFin += 24;

    }


    const horas =
        horaFin - horaInicio;


    if (horas <= 0) {

        resultado.textContent =
            "Horario inválido.";

        return;

    }


    const nocturna =
        esHoraNocturna(inicio) ||
        esHoraNocturna(fin);


    if (nocturna) {

        resultado.innerHTML =
            `<strong>Hora Extra Nocturna</strong> —
            ${horas.toFixed(2)} horas —
            Recargo extra + nocturnidad`;

    } else {

        resultado.innerHTML =
            `<strong>Hora Extra Diurna</strong> —
            ${horas.toFixed(2)} horas —
            Recargo del 100%`;

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
                    ).value;


                const inicio =
                    fila.querySelector(
                        ".extra-inicio"
                    ).value;


                const fin =
                    fila.querySelector(
                        ".extra-fin"
                    ).value;


                if (
                    !fecha ||
                    !inicio ||
                    !fin
                ) {

                    return;

                }


                let horaInicio =
                    convertirHora(
                        inicio
                    );


                let horaFin =
                    convertirHora(
                        fin
                    );


                if (
                    horaFin <=
                    horaInicio
                ) {

                    horaFin += 24;

                }


                const horas =
                    horaFin -
                    horaInicio;


                if (horas <= 0) {
                    return;
                }


                const nocturna =
                    esHoraNocturna(
                        inicio
                    ) ||
                    esHoraNocturna(
                        fin
                    );


                const multiplicador =
                    nocturna
                        ? 2.25
                        : 2.00;


                /*
                    Salario mensual / 30 / 8
                    = valor de hora ordinaria
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

                    horas,

                    tipo:
                        nocturna
                            ? "Hora Extra Nocturna"
                            : "Hora Extra Diurna",

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

    if (causa === "despido") {

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
        anos < 2 ||
        preaviso !== "si"
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
   AGUINALDO
========================================================== */

function calcularISR(
    monto
) {

    let isr = 0;


    if (monto <= 472) {

        isr = 0;

    } else if (monto <= 895.24) {

        isr =
            (monto - 472) *
            0.10 +
            17.67;

    } else if (monto <= 2038.10) {

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



function calcularAguinaldo(
    salario,
    tiempo,
    fechaFin
) {

    const fecha =
        obtenerFecha(
            fechaFin
        );


    const anos =
        Math.floor(
            tiempo
        );


    let diasBase;


    if (anos >= 10) {

        diasBase = 21;

    } else if (anos >= 3) {

        diasBase = 19;

    } else {

        diasBase = 15;

    }


    const salarioDiario =
        salario / 30;


    const tipo =
        document.querySelector(
            'input[name="aguinaldo_tipo"]:checked'
        ).value;


    /*
       Aguinaldo proporcional
    */

    if (
        tipo === "proporcional" ||
        tiempo < 1
    ) {

        let inicioPeriodo =
            new Date(
                fecha.getFullYear() - 1,
                11,
                12
            );


        if (
            fecha <
            new Date(
                fecha.getFullYear(),
                11,
                12
            )
        ) {

            inicioPeriodo =
                new Date(
                    fecha.getFullYear() - 2,
                    11,
                    12
                );

        }


        const dias =
            Math.min(
                365,
                Math.max(
                    0,
                    Math.ceil(
                        (
                            fecha -
                            inicioPeriodo
                        ) /
                        86400000
                    )
                )
            );


        return redondear(
            salarioDiario *
            diasBase *
            dias /
            365
        );

    }


    return redondear(
        salarioDiario *
        diasBase
    );

}



/* ==========================================================
   VACACIONES
========================================================== */

function calcularVacaciones(
    salario
) {

    const tipo =
        document.querySelector(
            'input[name="vacaciones_tipo"]:checked'
        ).value;


    const salarioDiario =
        salario / 30;


    /*
       15 días + 30%
    */

    if (tipo === "completas") {

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
                    base + recargo
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
                base + recargo
            )

    };

}



/* ==========================================================
   ASUETOS
========================================================== */

function calcularAsuetos(
    salario
) {

    const opcion =
        document.querySelector(
            'input[name="laboro_asueto"]:checked'
        ).value;


    if (opcion !== "si") {

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
       Pago del día + 100% de recargo
       = 200%
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
       ISR:
       Se calcula sobre la base
       después de ISSS y AFP.
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

        if (n <= 20) {

            return unidades[n];

        }


        if (n < 30) {

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

        if (n < 100) {

            return menor100(n);

        }


        if (n === 100) {

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

        if (n === 0) {

            return "CERO";

        }


        if (n < 1000) {

            return menor1000(n);

        }


        if (n < 1000000) {

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


            if (resto) {

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


        if (resto) {

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

    event.preventDefault();


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


    if (fin < inicio) {

        alert(
            "La fecha de terminación no puede ser anterior a la fecha de ingreso."
        );

        return;

    }


    calcularTiempoAntiguedad();


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


    const causa =
        document.querySelector(
            'input[name="causa"]:checked'
        ).value;


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

            horasExtras.total

        );



    /* =====================================================
       DEDUCCIONES
    ====================================================== */

    const aplicarDeducciones =
        document.getElementById(
            "aplicar-deducciones"
        ).checked;


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
       GUARDAR RESULTADO
    ====================================================== */

    ultimoCalculo = {

        trabajador:
            document.getElementById(
                "nombre-trabajador"
            ).value,

        duiTrabajador:
            document.getElementById(
                "dui-trabajador"
            ).value,

        cargo:
            document.getElementById(
                "cargo-desempenado"
            ).value,

        patrono:
            document.getElementById(
                "nombre-patrono"
            ).value,

        duiPatrono:
            document.getElementById(
                "dui-patrono"
            ).value,

        salario,

        sector,

        fechaInicio,

        fechaFin,

        anos,

        meses,

        dias,

        causa,

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


    resultDetails.innerHTML = `


        <!-- DATOS -->

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



        <!-- PRESTACIONES -->

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



        <!-- DEDUCCIONES -->

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


    const alertas = [];


    const minimo =
        salariosMinimos[
            data.sector
        ];



    /* SALARIO MÍNIMO */

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



    /* TOPE */

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



    /* RENUNCIA */

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



    /* ASUETOS */

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



    /* HORAS EXTRAS */

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
       Se deja preparado para tu tabla de Supabase.

       No se ejecuta automáticamente aquí para
       no modificar tu estructura de base de datos
       sin conocer el nombre exacto de tu tabla.

       Tu conexión a Supabase se conserva arriba.
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



    /* =====================================================
       PÁGINA 1
    ====================================================== */

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
        `DUI: ${data.duiTrabajador}`,
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
            "Aguinaldo",
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


    doc.setFont(undefined, "bold");


    doc.text(
        "III. DEDUCCIONES LEGALES",
        15,
        y
    );


    doc.setFont(undefined, "normal");


    y += 8;


    doc.text(
        "ISSS",
        20,
        y
    );


    doc.text(
        dinero(data.isss),
        190,
        y,
        {
            align: "right"
        }
    );


    y += 7;


    doc.text(
        "AFP",
        20,
        y
    );


    doc.text(
        dinero(data.afp),
        190,
        y,
        {
            align: "right"
        }
    );


    y += 7;


    doc.text(
        "ISR",
        20,
        y
    );


    doc.text(
        dinero(data.isr),
        190,
        y,
        {
            align: "right"
        }
    );


    y += 7;


    doc.setFont(undefined, "bold");


    doc.text(
        "TOTAL DEDUCCIONES",
        20,
        y
    );


    doc.text(
        dinero(data.totalDeducciones),
        190,
        y,
        {
            align: "right"
        }
    );


    y += 12;


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



    /* ASUETOS */

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

                if (y > 270) {

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



    /* HORAS EXTRAS */

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

                if (y > 270) {

                    doc.addPage();

                    y = 20;

                }


                doc.text(
                    `${registro.fecha} ${registro.inicio}-${registro.fin} — ${registro.tipo} — ${registro.horas.toFixed(2)} h — ${dinero(registro.monto)}`,
                    20,
                    y
                );


                y += 5;

            }
        );

    }



    /* =====================================================
       PIE
    ====================================================== */

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



    /* =====================================================
       PÁGINA 2
    ====================================================== */

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
        "El presente documento contiene un cálculo informativo de las prestaciones laborales correspondientes a los datos proporcionados por el usuario. Los resultados deben ser verificados conforme a la legislación laboral vigente y las circunstancias particulares de la relación laboral.";


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



    doc.text(
        "Trabajador(a):",
        25,
        y
    );


    doc.line(
        25,
        y + 20,
        90,
        y + 20
    );


    doc.text(
        "Firma",
        50,
        y + 26
    );


    doc.text(
        "Patrono / Representante:",
        120,
        y
    );


    doc.line(
        120,
        y + 20,
        185,
        y + 20
    );


    doc.text(
        "Firma",
        145,
        y + 26
    );


    y += 50;


    doc.setFont(undefined, "bold");


    doc.text(
        "OBSERVACIÓN",
        15,
        y
    );


    doc.setFont(undefined, "normal");


    y += 8;


    const observacion =
        "Este comprobante es una herramienta de cálculo informativo y no sustituye la revisión de la autoridad laboral competente ni la documentación que pueda acreditar conceptos adicionales.";


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
        25;


    doc.setFontSize(
        8
    );


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



    /* =====================================================
       NOMBRE DEL ARCHIVO
    ====================================================== */

    const nombre =
        data.trabajador
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
        `Comprobante_Liquidacion_${nombre}.pdf`
    );

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



        /* SALARIO */

        document
            .getElementById(
                "salario"
            )
            .addEventListener(
                "input",
                actualizarTope
            );


        /* SECTOR */

        document
            .getElementById(
                "sector"
            )
            .addEventListener(
                "change",
                actualizarTope
            );


        /* CARGO */

        document
            .getElementById(
                "cargo-tipo"
            )
            .addEventListener(
                "change",
                updatePreavisoText
            );

    }
);