const selectorSedes = document.querySelector(".selector-sedes");
const panelCuentas = document.querySelector(".panel-cuentas");
const bienvenidaTitulo = document.querySelector("#bienvenida-titulo");
const cambiarSede = document.querySelector("#cambiar-sede");
const reiniciarCuentas = document.querySelector("#reiniciar-cuentas");
const formularioMovimiento = document.querySelector("#formulario-movimiento");
const seccionNuevoMovimiento = document.querySelector("#nuevo-movimiento");
const movimientosRecientesCuerpo = document.querySelector("#movimientos-recientes-cuerpo");
const filtroTipo = document.querySelector("#filtro-tipo");
const calendarioFecha = document.querySelector("#calendario-fecha");
const abrirCalendario = document.querySelector("#abrir-calendario");
const mesCalendario = document.querySelector("#mes-calendario");
const anoCalendario = document.querySelector("#ano-calendario");
const diasCalendario = document.querySelector("#dias-calendario");
const fechaElegida = document.querySelector("#fecha-elegida");
const limpiarFecha = document.querySelector("#limpiar-fecha");
const balancePrincipal = document.querySelector("#balance-principal");
const balanceSecundario = document.querySelector("#balance-secundario");
const cambiarMonedaBalance = document.querySelector("#cambiar-moneda-balance");
const estadoSemana = document.querySelector("#estado-semana");
const resultadoBs = document.querySelector("#resultado-bs");
const resultadoUsd = document.querySelector("#resultado-usd");
const datosGuardadosCuerpo = document.querySelector("#datos-guardados-cuerpo");
const detalleDiaGuardado = document.querySelector("#detalle-dia-guardado");
const tituloDetalleDia = document.querySelector("#titulo-detalle-dia");
const estadoDetalleDia = document.querySelector("#estado-detalle-dia");
const listaDetalleDia = document.querySelector("#lista-detalle-dia");
const botonesSemana = document.querySelectorAll(".boton-semana");
const formularioTasa = document.querySelector("#formulario-tasa");
const fechaTasa = document.querySelector("#fecha-tasa");
const valorTasa = document.querySelector("#valor-tasa");
const estadoTasa = document.querySelector("#estado-tasa");
const fechaMovimiento = document.querySelector("#fecha-movimiento");
const tipoMovimiento = document.querySelector("#tipo-movimiento");
const monedaMovimiento = document.querySelector("#moneda-movimiento");
const montoMovimiento = document.querySelector("#monto-movimiento");
const estadoConversion = document.querySelector("#estado-conversion");
const metodoMovimiento = document.querySelector("#metodo-movimiento");
const campoMetodoDestino = document.querySelector("#campo-metodo-destino");
const metodoDestino = document.querySelector("#metodo-destino");
const fechaCierre = document.querySelector("#fecha-cierre");
const cierreCajaCuerpo = document.querySelector("#cierre-caja-cuerpo");
const guardarCierre = document.querySelector("#guardar-cierre");
const estadoCierre = document.querySelector("#estado-cierre");
const graficoColumnas = document.querySelector("#grafico-columnas");
const periodoGrafico = document.querySelector("#periodo-grafico");
const resumenGrafico = document.querySelector("#resumen-grafico");
const escalaGraficoMaxima = document.querySelector("#grafico-escala-maxima");
const escalaGraficoMedia = document.querySelector("#grafico-escala-media");
const botonesMonedaGrafico = document.querySelectorAll(".moneda-grafico");
const abrirUsuarios = document.querySelector("#abrir-usuarios");
const dialogoUsuarios = document.querySelector("#dialogo-usuarios");
const cerrarDialogoUsuarios = document.querySelector("#cerrar-dialogo-usuarios");
const listaUsuarios = document.querySelector("#lista-usuarios");
const estadoListaUsuarios = document.querySelector("#estado-lista-usuarios");
const detalleUsuarioAdmin = document.querySelector("#detalle-usuario-admin");
const nombreUsuarioAdmin = document.querySelector("#nombre-usuario-admin");
const rolUsuarioAdmin = document.querySelector("#rol-usuario-admin");
const ipUsuarioAdmin = document.querySelector("#ip-usuario-admin");
const bloquearUsuario = document.querySelector("#bloquear-usuario");
const revisarTransacciones = document.querySelector("#revisar-transacciones");
const selectorRolUsuario = document.querySelector("#rol-seleccionado");
const guardarRolUsuario = document.querySelector("#guardar-rol-usuario");
const transaccionesUsuario = document.querySelector("#transacciones-usuario");
const transaccionesUsuarioCuerpo = document.querySelector("#transacciones-usuario-cuerpo");
const bitacoraUsuarioCuerpo = document.querySelector("#bitacora-usuario-cuerpo");

const CLAVE_TASAS_CAMBIO = "tasasCambioDiarias";
const METODOS_PAGO = [
	{ value: "efectivo-usd", label: "Efectivo USD" },
	{ value: "efectivo-bs", label: "Efectivo Bs" },
	{ value: "zelle", label: "Zelle" },
	{ value: "pago-movil", label: "Pago Móvil" },
	{ value: "punto-venta", label: "Punto de Venta" },
	{ value: "binance", label: "Binance" },
	{ value: "bio-pago", label: "Bio Pago" },
];

let sedeSeleccionada = false;
let sedeActual = "";
let balanceEnBolivares = false;
let monedaGrafico = "USD";
let fechaFiltroMovimientos = "";
let fechaSeleccionadaMovimientos = "";
let usuarioRevisado = "";
let usuariosBackend = new Map();

const obtenerFechaActual = () => {
	const hoy = new Date();
	return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
};

const obtenerTasasCambio = () => {
	try {
		const datos = JSON.parse(localStorage.getItem(CLAVE_TASAS_CAMBIO) || "{}");
		return datos && typeof datos === "object" && !Array.isArray(datos) ? datos : {};
	} catch {
		return {};
	}
};

const obtenerTasaCambio = (fecha) => {
	const tasa = Number(obtenerTasasCambio()[fecha]);
	return Number.isFinite(tasa) && tasa > 0 ? tasa : 0;
};

const formatearImporte = (monto) => monto.toLocaleString("es-VE", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

const redondearImporte = (monto) => Math.round((monto + Number.EPSILON) * 100) / 100;

const obtenerMontosEquivalentes = (movimiento) => {
	const monto = Number(movimiento.monto) || 0;
	return {
		USD: Number.isFinite(movimiento.montoUSD)
			? movimiento.montoUSD
			: movimiento.moneda === "USD" ? monto : 0,
		Bs: Number.isFinite(movimiento.montoBs)
			? movimiento.montoBs
			: movimiento.moneda === "Bs" ? monto : 0,
	};
};

const actualizarEstadoConversion = () => {
	const tasa = obtenerTasaCambio(fechaMovimiento.value);
	const monto = Number(montoMovimiento.value);
	if (!tasa) {
		estadoConversion.textContent = `Falta guardar la tasa para ${fechaMovimiento.value || "la fecha seleccionada"}.`;
		return;
	}
	if (!Number.isFinite(monto) || monto <= 0 || !monedaMovimiento.value) {
		estadoConversion.textContent = `Tasa para ${fechaMovimiento.value}: 1 USD = Bs ${formatearImporte(tasa)}.`;
		return;
	}
	const equivalente = redondearImporte(monedaMovimiento.value === "USD" ? monto * tasa : monto / tasa);
	const signoEquivalente = monedaMovimiento.value === "USD" ? "Bs" : "$";
	estadoConversion.textContent = `Equivalente estimado: ${signoEquivalente} ${formatearImporte(equivalente)} · Tasa: 1 USD = Bs ${formatearImporte(tasa)}.`;
};

const actualizarEstadoTasa = () => {
	const tasa = obtenerTasaCambio(fechaTasa.value);
	if (!fechaTasa.value) {
		estadoTasa.textContent = "Selecciona la fecha de vigencia de la tasa.";
	} else if (tasa) {
		valorTasa.value = String(tasa);
		estadoTasa.textContent = `Tasa guardada para ${fechaTasa.value}: 1 USD = Bs ${formatearImporte(tasa)}.`;
	} else {
		valorTasa.value = "";
		estadoTasa.textContent = `No hay una tasa guardada para ${fechaTasa.value}.`;
	}
	actualizarEstadoConversion();
};

const actualizarCamposTransferencia = () => {
	const esTransferencia = tipoMovimiento.value === "transferencia";
	campoMetodoDestino.hidden = !esTransferencia;
	metodoDestino.required = esTransferencia;
	if (!esTransferencia) metodoDestino.value = "";
};

const obtenerMovimientos = () => {
	try {
		const datos = JSON.parse(localStorage.getItem(`movimientos-${sedeActual}`) || "[]");
		return Array.isArray(datos) ? datos : [];
	} catch {
		return [];
	}
};

const obtenerNombreMetodo = (valor) => METODOS_PAGO.find((metodo) => metodo.value === valor)?.label || "Sin clasificar";

const obtenerUsuarioActual = () => sessionStorage.getItem("marinoUsuarioActual") || "Sin identificar";

const obtenerRolUsuario = (usuario) => {
	if (usuario === obtenerUsuarioActual()) {
		const rolSesion = sessionStorage.getItem("marinoRolActual");
		if (rolSesion) return rolSesion;
	}
	return usuariosBackend.get(usuario)?.role || (usuario === "Programador" ? "administrador" : "cajero");
};

const esAdministrador = () => obtenerRolUsuario(obtenerUsuarioActual()) === "administrador";

const guardarEventoAuditoria = (evento) => {
	window.marinoBackend.solicitar("/api/audit", {
		method: "POST",
		body: JSON.stringify({
			action: evento.accion,
			detail: `${evento.detalle || ""}${sedeActual ? ` · Sede: ${sedeActual}` : ""}`,
		}),
	}).catch((error) => console.error("No se pudo guardar la auditoría en el backend:", error));
};

const aplicarPermisosUsuario = () => {
	const administrador = esAdministrador();
	abrirUsuarios.hidden = !administrador;
	reiniciarCuentas.hidden = !administrador;
	[
		".resumen",
		"#grafico-semanal",
		"#configuracion-tasa",
		"#movimientos-recientes",
		"#cierre-caja",
		"#datos-guardados",
		"#resultado-semana",
	].forEach((selector) => {
		const elemento = document.querySelector(selector);
		if (elemento) elemento.hidden = !administrador;
	});
};

const obtenerCierresCaja = () => {
	try {
		const datos = JSON.parse(localStorage.getItem(`cierres-${sedeActual}`) || "{}");
		return datos && typeof datos === "object" && !Array.isArray(datos) ? datos : {};
	} catch {
		return {};
	}
};

const crearTotalesMetodo = () => ({
	ingresos: { USD: 0, Bs: 0 },
	gastos: { USD: 0, Bs: 0 },
	transferencias: { USD: 0, Bs: 0 },
});

const calcularTotalesCierre = (fecha) => {
	const totales = Object.fromEntries(METODOS_PAGO.map(({ value }) => [value, crearTotalesMetodo()]));
	let haySinClasificar = false;
	let transferenciasAntiguas = 0;
	const totalSinClasificar = () => {
		haySinClasificar = true;
		totales["sin-clasificar"] ||= crearTotalesMetodo();
		return totales["sin-clasificar"];
	};

	obtenerMovimientos().forEach((movimiento) => {
		if (movimiento.fecha !== fecha || !["USD", "Bs"].includes(movimiento.moneda)) return;
		const monto = Number(movimiento.monto) || 0;
		if (movimiento.tipo === "transferencia") {
			const origenValido = METODOS_PAGO.some(({ value }) => value === movimiento.metodo);
			const destinoValido = METODOS_PAGO.some(({ value }) => value === movimiento.metodoDestino);
			if (!origenValido || !destinoValido || movimiento.metodo === movimiento.metodoDestino) {
				transferenciasAntiguas += 1;
				return;
			}
			totales[movimiento.metodo].transferencias[movimiento.moneda] -= monto;
			totales[movimiento.metodoDestino].transferencias[movimiento.moneda] += monto;
			return;
		}

		if (movimiento.tipo !== "ingreso" && movimiento.tipo !== "gasto") return;
		const canalValido = METODOS_PAGO.some(({ value }) => value === movimiento.metodo);
		const canal = canalValido ? totales[movimiento.metodo] : totalSinClasificar();
		canal[movimiento.tipo === "ingreso" ? "ingresos" : "gastos"][movimiento.moneda] += monto;
	});

	return { totales, haySinClasificar, transferenciasAntiguas };
};

const formatearMontoCierre = (monto, moneda, conSigno = false) => {
	const signo = conSigno && monto > 0 ? "+ " : monto < 0 ? "- " : "";
	const simbolo = moneda === "USD" ? "$" : "Bs";
	return `${signo}${simbolo} ${formatearImporte(Math.abs(monto))}`;
};

const crearCeldaCierreValores = (valores, conSigno = false, marcarDiferencia = false) => {
	const celda = document.createElement("td");
	const contenedor = document.createElement("div");
	contenedor.className = "cierre-valores";
	["USD", "Bs"].forEach((moneda) => {
		const valor = document.createElement("span");
		valor.textContent = valores[moneda] === null
			? "Pendiente"
			: formatearMontoCierre(valores[moneda], moneda, conSigno);
		if (marcarDiferencia && typeof valores[moneda] === "number") {
			if (valores[moneda] < 0) valor.classList.add("cierre-diferencia-faltante");
			if (valores[moneda] > 0) valor.classList.add("cierre-diferencia-sobrante");
		}
		contenedor.append(valor);
	});
	celda.append(contenedor);
	return celda;
};

const crearEntradaCierre = (metodo, tipo, moneda, valor) => {
	const entrada = document.createElement("input");
	entrada.className = "entrada-cierre";
	entrada.type = "number";
	entrada.min = "0";
	entrada.step = "0.01";
	entrada.value = valor === null || valor === undefined
		? tipo === "apertura" ? "0" : ""
		: String(valor);
	entrada.dataset.metodo = metodo.value;
	entrada.dataset.tipo = tipo;
	entrada.dataset.moneda = moneda;
	entrada.setAttribute("aria-label", `${tipo === "apertura" ? "Saldo inicial" : "Saldo contado"} de ${metodo.label} en ${moneda}`);
	return entrada;
};

const mostrarCierreCaja = () => {
	if (!fechaCierre.value) fechaCierre.value = obtenerFechaActual();
	const fecha = fechaCierre.value;
	const cierres = obtenerCierresCaja();
	const cierreDia = cierres[fecha] || {};
	const { totales, haySinClasificar, transferenciasAntiguas } = calcularTotalesCierre(fecha);
	const metodos = haySinClasificar
		? [...METODOS_PAGO, { value: "sin-clasificar", label: "Sin clasificar" }]
		: METODOS_PAGO;
	cierreCajaCuerpo.replaceChildren();

	metodos.forEach((metodo) => {
		const fila = document.createElement("tr");
		fila.dataset.metodo = metodo.value;
		const nombre = document.createElement("th");
		nombre.scope = "row";
		nombre.textContent = metodo.label;
		fila.append(nombre);

		const guardado = cierreDia[metodo.value] || {};
		const crearCeldaEntradas = (tipo, valores) => {
			const celda = document.createElement("td");
			const contenedor = document.createElement("div");
			contenedor.className = "cierre-entradas";
			["USD", "Bs"].forEach((moneda) => {
				const grupo = document.createElement("label");
				grupo.className = "cierre-entrada-grupo";
				const etiqueta = document.createElement("span");
				etiqueta.textContent = moneda;
				grupo.append(etiqueta, crearEntradaCierre(metodo, tipo, moneda, valores[moneda]));
				contenedor.append(grupo);
			});
			celda.append(contenedor);
			return celda;
		};

		fila.append(crearCeldaEntradas("apertura", guardado.apertura || {}));
		fila.append(crearCeldaCierreValores(totales[metodo.value].ingresos));
		fila.append(crearCeldaCierreValores(totales[metodo.value].gastos));
		fila.append(crearCeldaCierreValores(totales[metodo.value].transferencias, true));

		let celdaEsperado = crearCeldaCierreValores({ USD: 0, Bs: 0 });
		const celdaContado = crearCeldaEntradas("contado", guardado.contado || {});
		let celdaDiferencia = crearCeldaCierreValores({ USD: null, Bs: null }, true, true);
		fila.append(celdaEsperado, celdaContado, celdaDiferencia);

		const actualizarFila = () => {
			const leerEntrada = (tipo, moneda) => {
				const entrada = fila.querySelector(`[data-tipo="${tipo}"][data-moneda="${moneda}"]`);
				return entrada.value === "" ? null : Number(entrada.value) || 0;
			};
			const esperado = {};
			const diferencia = {};
			["USD", "Bs"].forEach((moneda) => {
				esperado[moneda] = (leerEntrada("apertura", moneda) || 0)
					+ totales[metodo.value].ingresos[moneda]
					- totales[metodo.value].gastos[moneda]
					+ totales[metodo.value].transferencias[moneda];
				const contado = leerEntrada("contado", moneda);
				diferencia[moneda] = contado === null ? null : contado - esperado[moneda];
			});
			const nuevaCeldaEsperado = crearCeldaCierreValores(esperado);
			const nuevaCeldaDiferencia = crearCeldaCierreValores(diferencia, true, true);
			celdaEsperado.replaceWith(nuevaCeldaEsperado);
			celdaDiferencia.replaceWith(nuevaCeldaDiferencia);
			celdaEsperado = nuevaCeldaEsperado;
			celdaDiferencia = nuevaCeldaDiferencia;
		};

		fila.querySelectorAll(".entrada-cierre").forEach((entrada) => {
			entrada.addEventListener("input", actualizarFila);
		});
		actualizarFila();
		cierreCajaCuerpo.append(fila);
	});

	estadoCierre.textContent = transferenciasAntiguas
		? `${transferenciasAntiguas} transferencia(s) anterior(es) no tienen canal de origen y destino y no se incluyen en el saldo esperado.`
		: "Ingresa los saldos de apertura y el conteo físico o digital para calcular las diferencias.";
};

const fechaDesdeTexto = (texto) => {
	const [ano, mes, dia] = texto.split("-").map(Number);
	return new Date(ano, mes - 1, dia);
};

const formatearFecha = (fecha) => {
	return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
};

const obtenerRangoSemana = (semanasAtras = 0) => {
	const inicio = new Date();
	const diaSemana = inicio.getDay() || 7;
	inicio.setHours(0, 0, 0, 0);
	inicio.setDate(inicio.getDate() - diaSemana + 1 - semanasAtras * 7);
	const fin = new Date(inicio);
	fin.setDate(inicio.getDate() + 6);
	return { inicio, fin };
};

const mostrarCalendario = () => {
	const ano = Number(anoCalendario.value);
	const mes = Number(mesCalendario.value);
	diasCalendario.replaceChildren();
	if (!Number.isInteger(ano) || ano < 1900 || ano > 2100) return;

	const espacios = (new Date(ano, mes, 1).getDay() + 6) % 7;
	const cantidadDias = new Date(ano, mes + 1, 0).getDate();
	for (let indice = 0; indice < espacios; indice += 1) {
		const espacio = document.createElement("span");
		espacio.className = "dia-calendario-vacio";
		espacio.setAttribute("aria-hidden", "true");
		diasCalendario.append(espacio);
	}
	for (let dia = 1; dia <= cantidadDias; dia += 1) {
		const boton = document.createElement("button");
		const fecha = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
		boton.type = "button";
		boton.className = "dia-calendario";
		boton.textContent = String(dia);
		boton.setAttribute("aria-pressed", String(fecha === fechaSeleccionadaMovimientos));
		boton.addEventListener("click", () => {
			fechaSeleccionadaMovimientos = fecha;
			fechaElegida.textContent = new Date(ano, mes, dia).toLocaleDateString("es-VE");
			limpiarFecha.hidden = false;
			calendarioFecha.hidden = true;
			abrirCalendario.setAttribute("aria-expanded", "false");
		});
		diasCalendario.append(boton);
	}
};

const cambiarMesCalendario = (cantidad) => {
	const fecha = new Date(Number(anoCalendario.value), Number(mesCalendario.value) + cantidad, 1);
	anoCalendario.value = String(fecha.getFullYear());
	mesCalendario.value = String(fecha.getMonth());
	mostrarCalendario();
};

const actualizarTarjeta = (id, dolares, bolivares) => {
	const usd = `$ ${dolares.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	const bs = `Bs ${bolivares.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	if (id === "balance-semana") {
		balancePrincipal.textContent = balanceEnBolivares ? bs : usd;
		balanceSecundario.textContent = balanceEnBolivares ? usd : bs;
		cambiarMonedaBalance.textContent = balanceEnBolivares ? "$" : "Bs";
		cambiarMonedaBalance.setAttribute("aria-label", balanceEnBolivares ? "Mostrar balance en dólares" : "Mostrar balance en bolívares");
		return;
	}
	const tarjeta = document.querySelector(`#${id}`);
	tarjeta.firstChild.textContent = balanceEnBolivares ? bs : usd;
	tarjeta.lastElementChild.textContent = balanceEnBolivares ? usd : bs;
};

const formatearResultado = (moneda, total) => {
	const signo = total < 0 ? "- " : "";
	const valor = Math.abs(total).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	return `${signo}${moneda} ${valor}`;
};

const actualizarResumen = (semanasAtras = 0) => {
	const rango = obtenerRangoSemana(semanasAtras);
	const totales = { ingresos: { USD: 0, Bs: 0 }, gastos: { USD: 0, Bs: 0 } };
	obtenerMovimientos().forEach((movimiento) => {
		if (movimiento.tipo !== "ingreso" && movimiento.tipo !== "gasto") return;
		const fecha = fechaDesdeTexto(movimiento.fecha);
		if (fecha < rango.inicio || fecha > rango.fin) return;
		const montos = obtenerMontosEquivalentes(movimiento);
		totales[movimiento.tipo + "s"].USD += montos.USD;
		totales[movimiento.tipo + "s"].Bs += montos.Bs;
	});

	const balanceUsd = totales.ingresos.USD - totales.gastos.USD;
	const balanceBs = totales.ingresos.Bs - totales.gastos.Bs;
	actualizarTarjeta("ingresos-semana", totales.ingresos.USD, totales.ingresos.Bs);
	actualizarTarjeta("gastos-semana", totales.gastos.USD, totales.gastos.Bs);
	actualizarTarjeta("balance-semana", balanceUsd, balanceBs);
	resultadoUsd.textContent = formatearResultado("$", balanceUsd);
	resultadoBs.textContent = formatearResultado("Bs", balanceBs);
	resultadoUsd.classList.toggle("resultado-negativo", balanceUsd < 0);
	resultadoBs.classList.toggle("resultado-negativo", balanceBs < 0);
	estadoSemana.className = "estado-semana";

	const hayMovimientos = Object.values(totales.ingresos).some(Boolean)
		|| Object.values(totales.gastos).some(Boolean);
	if (!hayMovimientos) {
		estadoSemana.textContent = "Sin movimientos registrados";
	} else if (balanceUsd === 0 && balanceBs === 0) {
		estadoSemana.textContent = "En equilibrio";
		estadoSemana.classList.add("equilibrio");
	} else if (balanceUsd < 0 || balanceBs < 0) {
		estadoSemana.textContent = "Resultado negativo";
		estadoSemana.classList.add("negativo");
	} else {
		estadoSemana.textContent = "Resultado positivo";
		estadoSemana.classList.add("positivo");
	}

	document.querySelector("#etiqueta-balance").textContent = semanasAtras ? "Balance de la semana pasada" : "Balance Actual";
	document.querySelector("#etiqueta-ingresos").textContent = semanasAtras ? "Ingresos de la semana pasada" : "Ingresos Actuales";
	document.querySelector("#etiqueta-gastos").textContent = semanasAtras ? "Gastos de la semana pasada" : "Gastos Actuales";
	const formato = { day: "2-digit", month: "2-digit" };
	document.querySelector("#periodo-semana").textContent = `${semanasAtras ? "Semana pasada" : "Semana actual"} · ${rango.inicio.toLocaleDateString("es-VE", formato)} - ${rango.fin.toLocaleDateString("es-VE", formato)}`;
	mostrarGraficoSemanal(semanasAtras);
};

const mostrarGraficoSemanal = (semanasAtras = 0) => {
	const rango = obtenerRangoSemana(semanasAtras);
	const formatoFecha = { day: "2-digit", month: "2-digit" };
	const dias = Array.from({ length: 7 }, (_, indice) => {
		const fecha = new Date(rango.inicio);
		fecha.setDate(rango.inicio.getDate() + indice);
		return {
			fecha: formatearFecha(fecha),
			etiqueta: fecha.toLocaleDateString("es-VE", { weekday: "short" }).replace(".", ""),
			ingresos: 0,
			gastos: 0,
		};
	});
	const totalesPorFecha = new Map(dias.map((dia) => [dia.fecha, dia]));
	obtenerMovimientos().forEach((movimiento) => {
		if (movimiento.tipo !== "ingreso" && movimiento.tipo !== "gasto") return;
		const dia = totalesPorFecha.get(movimiento.fecha);
		if (!dia) return;
		dia[movimiento.tipo === "ingreso" ? "ingresos" : "gastos"] += obtenerMontosEquivalentes(movimiento)[monedaGrafico];
	});

	const totalIngresos = dias.reduce((total, dia) => total + dia.ingresos, 0);
	const totalGastos = dias.reduce((total, dia) => total + dia.gastos, 0);
	const maximoDia = Math.max(0, ...dias.flatMap((dia) => [dia.ingresos, dia.gastos]));
	const escala = maximoDia > 0 ? maximoDia * 1.12 : 1;
	const simbolo = monedaGrafico === "USD" ? "$" : "Bs";
	const importe = (monto) => `${simbolo} ${formatearImporte(monto)}`;

	periodoGrafico.textContent = `${semanasAtras ? "Semana pasada" : "Semana actual"} · ${rango.inicio.toLocaleDateString("es-VE", formatoFecha)} - ${rango.fin.toLocaleDateString("es-VE", formatoFecha)}`;
	escalaGraficoMaxima.textContent = importe(escala);
	escalaGraficoMedia.textContent = importe(escala / 2);
	graficoColumnas.replaceChildren();

	dias.forEach((dia) => {
		const columna = document.createElement("div");
		columna.className = "grafico-dia";
		const barras = document.createElement("div");
		barras.className = "grafico-barras";
		const fechaDia = new Date(`${dia.fecha}T00:00:00`);
		const etiquetaCompleta = fechaDia.toLocaleDateString("es-VE", { weekday: "long", day: "numeric", month: "long" });

		[["ingresos", "Ingresos"], ["gastos", "Gastos"]].forEach(([tipo, nombre]) => {
			const barra = document.createElement("span");
			barra.className = `grafico-barra grafico-barra-${tipo}`;
			barra.setAttribute("role", "img");
			barra.setAttribute("aria-label", `${nombre} del ${etiquetaCompleta}: ${importe(dia[tipo])}`);
			barra.title = `${nombre} · ${etiquetaCompleta}: ${importe(dia[tipo])}`;
			barra.tabIndex = 0;
			barra.style.height = "0%";
			barras.append(barra);
			requestAnimationFrame(() => {
				barra.style.height = `${maximoDia > 0 ? dia[tipo] / escala * 100 : 0}%`;
			});
		});

		const etiquetaDia = document.createElement("span");
		etiquetaDia.className = "grafico-etiqueta-dia";
		etiquetaDia.textContent = dia.etiqueta;
		columna.append(barras, etiquetaDia);
		graficoColumnas.append(columna);
	});

	const diferencia = totalIngresos - totalGastos;
	resumenGrafico.textContent = `${monedaGrafico === "USD" ? "USD" : "Bolívares"} · Ingresos ${importe(totalIngresos)} · Gastos ${importe(totalGastos)} · Balance ${importe(diferencia)}.`;
};

const obtenerSedesRegistradas = () => Array.from(
	document.querySelectorAll(".sede-opcion"),
	(opcion) => opcion.dataset.sede,
);

const obtenerMovimientosDeSede = (sede) => {
	try {
		const movimientos = JSON.parse(localStorage.getItem(`movimientos-${sede}`) || "[]");
		return Array.isArray(movimientos) ? movimientos : [];
	} catch {
		return [];
	}
};

const obtenerUsuariosRegistrados = () => {
	const usuarios = new Set(["Programador"]);
	obtenerSedesRegistradas().forEach((sede) => {
		obtenerMovimientosDeSede(sede).forEach((movimiento) => {
			const usuario = movimiento.usuario || movimiento.responsable;
			if (usuario && usuario !== "Sin indicar") usuarios.add(usuario);
		});
	});
	return Array.from(usuarios).sort((a, b) => a.localeCompare(b, "es"));
};

const formatearFechaHoraAuditoria = (fechaHora) => {
	const fecha = new Date(fechaHora);
	return Number.isNaN(fecha.getTime())
		? "Hora no disponible"
		: fecha.toLocaleString("es-VE", { dateStyle: "short", timeStyle: "medium" });
};

const agregarCeldaTexto = (fila, texto) => {
	const celda = document.createElement("td");
	celda.textContent = texto;
	fila.append(celda);
};

const mostrarRevisionUsuario = async () => {
	transaccionesUsuario.hidden = false;
	transaccionesUsuarioCuerpo.replaceChildren();
	bitacoraUsuarioCuerpo.replaceChildren();
	obtenerSedesRegistradas().forEach((sede) => {
		obtenerMovimientosDeSede(sede).forEach((movimiento) => {
			if ((movimiento.usuario || movimiento.responsable) !== usuarioRevisado) return;
			const fila = document.createElement("tr");
			agregarCeldaTexto(fila, movimiento.fecha || "Sin fecha");
			agregarCeldaTexto(fila, movimiento.tipo || "Sin tipo");
			agregarCeldaTexto(fila, movimiento.concepto || "Sin concepto");
			agregarCeldaTexto(fila, `${movimiento.moneda === "USD" ? "$" : "Bs"} ${movimiento.monto ?? "0"}`);
			agregarCeldaTexto(fila, sede);
			transaccionesUsuarioCuerpo.append(fila);
		});
	});
	if (!transaccionesUsuarioCuerpo.children.length) {
		const fila = document.createElement("tr");
		const celda = document.createElement("td");
		celda.colSpan = 5;
		celda.textContent = "Este usuario todavía no tiene movimientos registrados.";
		fila.append(celda);
		transaccionesUsuarioCuerpo.append(fila);
	}

	try {
		const eventos = await window.marinoBackend.solicitar(
			`/api/admin/audit?username=${encodeURIComponent(usuarioRevisado)}`,
		);
		eventos.forEach((evento) => {
			const fila = document.createElement("tr");
			agregarCeldaTexto(fila, formatearFechaHoraAuditoria(evento.created_at));
			agregarCeldaTexto(fila, evento.action || "Actividad");
			agregarCeldaTexto(fila, evento.detail || "");
			agregarCeldaTexto(fila, evento.ip_address || "No disponible");
			bitacoraUsuarioCuerpo.append(fila);
		});
	} catch (error) {
		const fila = document.createElement("tr");
		const celda = document.createElement("td");
		celda.colSpan = 4;
		celda.textContent = error.message;
		fila.append(celda);
		bitacoraUsuarioCuerpo.append(fila);
	}
	if (!bitacoraUsuarioCuerpo.children.length) {
		const fila = document.createElement("tr");
		const celda = document.createElement("td");
		celda.colSpan = 4;
		celda.textContent = "No hay eventos de bitácora para este usuario.";
		fila.append(celda);
		bitacoraUsuarioCuerpo.append(fila);
	}
};

const mostrarDetalleUsuario = (usuario) => {
	usuarioRevisado = usuario;
	const cuenta = usuariosBackend.get(usuario);
	const bloqueado = Boolean(cuenta?.blocked);
	const rol = cuenta?.role || obtenerRolUsuario(usuario);
	detalleUsuarioAdmin.hidden = false;
	nombreUsuarioAdmin.textContent = usuario;
	rolUsuarioAdmin.textContent = `Rol: ${rol === "administrador" ? "Administrador / Gerente" : "Cajero"} · ${bloqueado ? "Bloqueado" : "Activo"}`;
	ipUsuarioAdmin.textContent = `IP reciente: ${cuenta?.last_ip || "Sin registro"}`;
	selectorRolUsuario.value = rol;
	const esUsuarioActual = usuario === obtenerUsuarioActual();
	selectorRolUsuario.disabled = esUsuarioActual;
	guardarRolUsuario.disabled = esUsuarioActual;
	bloquearUsuario.disabled = esUsuarioActual;
	bloquearUsuario.textContent = bloqueado ? "Desbloquear usuario" : "Bloquear usuario";
	transaccionesUsuario.hidden = true;
};

const actualizarListaUsuarios = async () => {
	listaUsuarios.replaceChildren();
	let cuentasServidor = [];
	try {
		cuentasServidor = await window.marinoBackend.solicitar("/api/admin/users");
	} catch (error) {
		estadoListaUsuarios.textContent = `No se pudo cargar la lista privada: ${error.message}`;
	}
	usuariosBackend = new Map(cuentasServidor.map((cuenta) => [cuenta.username, cuenta]));
	const usuarios = Array.from(new Set([
		...obtenerUsuariosRegistrados(),
		...cuentasServidor.map((cuenta) => cuenta.username),
	])).sort((a, b) => a.localeCompare(b, "es"));
	usuarios.forEach((usuario) => {
		const boton = document.createElement("button");
		boton.type = "button";
		boton.className = "usuario-admin-opcion";
		boton.classList.toggle("activo", usuario === usuarioRevisado);
		const cuenta = usuariosBackend.get(usuario);
		const estado = cuenta?.blocked ? "Bloqueado" : cuenta?.role || obtenerRolUsuario(usuario);
		boton.textContent = `${usuario} · ${estado}`;
		boton.addEventListener("click", () => mostrarDetalleUsuario(usuario));
		listaUsuarios.append(boton);
	});
	estadoListaUsuarios.textContent = "Usuarios e IPs consultados al backend local; las IPs solo se muestran a un administrador.";
};

const abrirPanelUsuarios = async () => {
	if (!esAdministrador()) return;
	await actualizarListaUsuarios();
	if (!usuariosBackend.has(usuarioRevisado)) usuarioRevisado = obtenerUsuarioActual();
	mostrarDetalleUsuario(usuarioRevisado);
	dialogoUsuarios.showModal();
};

const editarMovimiento = (indice) => {
	if (!esAdministrador()) return;
	const movimientos = obtenerMovimientos();
	const movimiento = movimientos[indice];
	if (!movimiento) return;
	const concepto = prompt("Editar concepto:", movimiento.concepto || "");
	if (concepto === null) return;
	const montoTexto = prompt("Editar monto:", String(movimiento.monto));
	if (montoTexto === null) return;
	const monto = Number(montoTexto.replace(",", "."));
	if (!concepto.trim() || !Number.isFinite(monto) || monto <= 0) {
		window.alert("Escribe un concepto y un monto mayor que cero.");
		return;
	}

	const anterior = { concepto: movimiento.concepto, monto: movimiento.monto };
	const tasa = Number(movimiento.tasaCambio);
	movimiento.concepto = concepto.trim();
	movimiento.monto = monto;
	if (Number.isFinite(tasa) && tasa > 0) {
		movimiento.montoUSD = movimiento.moneda === "USD" ? monto : redondearImporte(monto / tasa);
		movimiento.montoBs = movimiento.moneda === "Bs" ? monto : redondearImporte(monto * tasa);
	}
	movimiento.editadoPor = obtenerUsuarioActual();
	movimiento.editadoEn = new Date().toISOString();
	movimientos[indice] = movimiento;
	localStorage.setItem(`movimientos-${sedeActual}`, JSON.stringify(movimientos));
	guardarEventoAuditoria({
		accion: "Editar movimiento",
		detalle: `${anterior.concepto} (${anterior.monto} ${movimiento.moneda}) -> ${movimiento.concepto} (${monto} ${movimiento.moneda})`,
		movimientoId: movimiento.id || `legacy-${indice}`,
	});
	actualizarVistaCuentas();
};

const eliminarMovimiento = (indice) => {
	if (!esAdministrador()) return;
	const movimientos = obtenerMovimientos();
	const movimiento = movimientos[indice];
	if (!movimiento || !window.confirm(`¿Eliminar el movimiento "${movimiento.concepto}"?`)) return;
	movimientos.splice(indice, 1);
	localStorage.setItem(`movimientos-${sedeActual}`, JSON.stringify(movimientos));
	guardarEventoAuditoria({
		accion: "Eliminar movimiento",
		detalle: `${movimiento.concepto} · ${movimiento.tipo} · ${movimiento.monto} ${movimiento.moneda}`,
		movimientoId: movimiento.id || `legacy-${indice}`,
	});
	actualizarVistaCuentas();
};

const mostrarMovimientos = () => {
	const todos = obtenerMovimientos();
	const tipoFiltro = filtroTipo.value;
	const movimientos = todos.map((movimiento, indice) => ({ movimiento, indice })).filter(({ movimiento }) =>
		(tipoFiltro === "todos" || movimiento.tipo === tipoFiltro.slice(0, -1))
		&& (!fechaFiltroMovimientos || movimiento.fecha === fechaFiltroMovimientos)
	);
	movimientosRecientesCuerpo.replaceChildren();
	if (!movimientos.length) {
		const fila = document.createElement("tr");
		const celda = document.createElement("td");
		celda.colSpan = 8;
		celda.textContent = todos.length ? "No hay movimientos para los filtros seleccionados." : "Todavía no hay movimientos registrados.";
		fila.append(celda);
		movimientosRecientesCuerpo.append(fila);
		return;
	}
	movimientos.slice().reverse().forEach(({ movimiento, indice }) => {
		const fila = document.createElement("tr");
		const montos = obtenerMontosEquivalentes(movimiento);
		const montoMostrado = Number.isFinite(movimiento.tasaCambio)
			? `$ ${formatearImporte(montos.USD)} / Bs ${formatearImporte(montos.Bs)}`
			: `${movimiento.moneda === "USD" ? "$" : "Bs"} ${movimiento.monto}`;
		const metodoMostrado = movimiento.tipo === "transferencia" && movimiento.metodoDestino
			? `${obtenerNombreMetodo(movimiento.metodo)} -> ${obtenerNombreMetodo(movimiento.metodoDestino)}`
			: obtenerNombreMetodo(movimiento.metodo);
		[movimiento.fecha, movimiento.tipo, movimiento.concepto, metodoMostrado,
			montoMostrado,
			movimiento.moneda === "USD" ? "Dólares" : "Bolívares", movimiento.usuario || movimiento.responsable || "Sin indicar"]
			.forEach((valor) => {
				const celda = document.createElement("td");
				celda.textContent = valor;
				fila.append(celda);
			});

		const celdaAcciones = document.createElement("td");
		if (esAdministrador()) {
			const botonEditar = document.createElement("button");
			botonEditar.type = "button";
			botonEditar.className = "accion-movimiento";
			botonEditar.textContent = "Editar";
			botonEditar.addEventListener("click", () => editarMovimiento(indice));
			const botonEliminar = document.createElement("button");
			botonEliminar.type = "button";
			botonEliminar.className = "accion-movimiento accion-eliminar";
			botonEliminar.textContent = "Eliminar";
			botonEliminar.addEventListener("click", () => eliminarMovimiento(indice));
			celdaAcciones.append(botonEditar, botonEliminar);
		} else {
			celdaAcciones.textContent = "Registrado";
		}
		fila.append(celdaAcciones);
		movimientosRecientesCuerpo.append(fila);
	});
};

const mostrarDetalleDia = (nombre, fecha, botonActivo) => {
	document.querySelectorAll(".dia-guardado").forEach((boton) => boton.classList.remove("activo"));
	botonActivo.classList.add("activo");
	const movimientos = obtenerMovimientos().filter((movimiento) => movimiento.fecha === fecha);
	tituloDetalleDia.textContent = `${nombre} · ${fecha}`;
	detalleDiaGuardado.hidden = false;
	listaDetalleDia.replaceChildren();
	estadoDetalleDia.textContent = movimientos.length
		? `${movimientos.length} movimiento(s) guardado(s).`
		: "No hay movimientos guardados para este día.";
	movimientos.forEach((movimiento) => {
		const elemento = document.createElement("li");
		const montos = obtenerMontosEquivalentes(movimiento);
		const detalleMontos = Number.isFinite(movimiento.tasaCambio)
			? `$ ${formatearImporte(montos.USD)} · Bs ${formatearImporte(montos.Bs)} · tasa Bs ${formatearImporte(movimiento.tasaCambio)}/USD`
			: `${movimiento.moneda === "USD" ? "$" : "Bs"} ${movimiento.monto}`;
		elemento.textContent = `${movimiento.tipo} · ${movimiento.concepto} · ${detalleMontos}`;
		listaDetalleDia.append(elemento);
	});
};

const mostrarDatosGuardados = () => {
	const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
	const semana = obtenerRangoSemana();
	const movimientosSemana = obtenerMovimientos();
	datosGuardadosCuerpo.replaceChildren();
	dias.forEach((nombre, indice) => {
		const fecha = new Date(semana.inicio);
		fecha.setDate(semana.inicio.getDate() + indice);
		const fechaTexto = formatearFecha(fecha);
		const movimientos = movimientosSemana.filter((movimiento) => movimiento.fecha === fechaTexto);
		const fila = document.createElement("tr");
		const encabezado = document.createElement("th");
		encabezado.scope = "row";
		const boton = document.createElement("button");
		boton.className = "dia-guardado";
		boton.type = "button";
		boton.dataset.fecha = fechaTexto;
		boton.textContent = nombre;
		boton.addEventListener("click", () => mostrarDetalleDia(nombre, fechaTexto, boton));
		encabezado.append(boton);
		fila.append(encabezado);

		const total = (tipo, moneda) => movimientos
			.filter((movimiento) => movimiento.tipo === tipo)
			.reduce((suma, movimiento) => suma + obtenerMontosEquivalentes(movimiento)[moneda], 0);
		[`$ ${total("ingreso", "USD").toFixed(2)}`, `Bs ${total("ingreso", "Bs").toFixed(2)}`,
			`$ ${total("gasto", "USD").toFixed(2)}`, `Bs ${total("gasto", "Bs").toFixed(2)}`,
			movimientos.length ? `${movimientos.length} movimiento(s)` : "Sin registros"].forEach((valor) => {
			const celda = document.createElement("td");
			celda.textContent = valor;
			fila.append(celda);
		});
		datosGuardadosCuerpo.append(fila);
	});
};

const actualizarVistaCuentas = () => {
	mostrarMovimientos();
	mostrarDatosGuardados();
	mostrarCierreCaja();
	actualizarResumen(document.querySelector(".boton-semana.activo").dataset.semana === "pasada" ? 1 : 0);
};

const inicializarCuentas = () => {
	const hoy = new Date();
	aplicarPermisosUsuario();
	fechaMovimiento.value = obtenerFechaActual();
	fechaCierre.value = obtenerFechaActual();
	fechaTasa.value = obtenerFechaActual();
	actualizarEstadoTasa();
	anoCalendario.value = String(hoy.getFullYear());
	mesCalendario.value = String(hoy.getMonth());
	filtroTipo.value = "todos";
	mostrarCalendario();
	mostrarMovimientos();
	mostrarDatosGuardados();
	mostrarCierreCaja();
	actualizarResumen();
};

abrirCalendario.addEventListener("click", () => {
	const abrir = calendarioFecha.hidden;
	if (abrir) {
		const fechaTexto = fechaSeleccionadaMovimientos || fechaFiltroMovimientos;
		const fecha = fechaTexto ? fechaDesdeTexto(fechaTexto) : new Date();
		anoCalendario.value = String(fecha.getFullYear());
		mesCalendario.value = String(fecha.getMonth());
		mostrarCalendario();
	}
	calendarioFecha.hidden = !abrir;
	abrirCalendario.setAttribute("aria-expanded", String(abrir));
});

document.querySelector("#mes-anterior").addEventListener("click", () => cambiarMesCalendario(-1));
document.querySelector("#mes-siguiente").addEventListener("click", () => cambiarMesCalendario(1));
mesCalendario.addEventListener("change", mostrarCalendario);
anoCalendario.addEventListener("input", mostrarCalendario);
filtroTipo.addEventListener("change", mostrarMovimientos);
document.querySelector("#aplicar-filtros").addEventListener("click", () => {
	fechaFiltroMovimientos = fechaSeleccionadaMovimientos;
	mostrarMovimientos();
});
limpiarFecha.addEventListener("click", () => {
	fechaSeleccionadaMovimientos = "";
	fechaFiltroMovimientos = "";
	fechaElegida.textContent = "Seleccionar fecha";
	limpiarFecha.hidden = true;
	mostrarMovimientos();
});

document.addEventListener("keydown", (evento) => {
	if (evento.key === "Escape" && !calendarioFecha.hidden) {
		calendarioFecha.hidden = true;
		abrirCalendario.setAttribute("aria-expanded", "false");
		abrirCalendario.focus();
	}
});
document.addEventListener("click", (evento) => {
	if (!evento.target.closest(".selector-fecha") && !calendarioFecha.hidden) {
		calendarioFecha.hidden = true;
		abrirCalendario.setAttribute("aria-expanded", "false");
	}
});

document.querySelectorAll(".sede-opcion").forEach((opcion) => {
	opcion.addEventListener("click", () => {
		sedeSeleccionada = true;
		sedeActual = opcion.dataset.sede;
		bienvenidaTitulo.textContent = `Bienvenido a la sede ${sedeActual}`;
		selectorSedes.hidden = true;
		panelCuentas.hidden = false;
		fechaFiltroMovimientos = "";
		fechaSeleccionadaMovimientos = "";
		fechaElegida.textContent = "Seleccionar fecha";
		limpiarFecha.hidden = true;
		inicializarCuentas();
		panelCuentas.scrollIntoView({ behavior: "smooth", block: "start" });
	});
});

cambiarSede.addEventListener("click", () => {
	sedeSeleccionada = false;
	sedeActual = "";
	panelCuentas.hidden = true;
	selectorSedes.hidden = false;
	selectorSedes.scrollIntoView({ behavior: "smooth", block: "start" });
});

reiniciarCuentas.addEventListener("click", () => {
	if (!sedeSeleccionada || !sedeActual) return;
	const sedes = new Set([
		...Array.from(document.querySelectorAll(".sede-opcion"), (opcion) => opcion.dataset.sede),
		sedeActual,
	]);
	sedes.forEach((sede) => {
		localStorage.setItem(`movimientos-${sede}`, "[]");
		localStorage.setItem(`cierres-${sede}`, "{}");
	});
	detalleDiaGuardado.hidden = true;
	listaDetalleDia.replaceChildren();
	tituloDetalleDia.textContent = "Selecciona un día";
	estadoDetalleDia.textContent = "Aquí aparecerán los movimientos guardados.";
	actualizarVistaCuentas();
});

formularioMovimiento.addEventListener("submit", (evento) => {
	evento.preventDefault();
	metodoMovimiento.setCustomValidity("");
	metodoDestino.setCustomValidity("");
	if (!sedeSeleccionada || !sedeActual || !formularioMovimiento.reportValidity()) return;

	const datos = new FormData(formularioMovimiento);
	const fecha = String(datos.get("fecha") || "");
	const tipo = datos.get("tipo");
	const moneda = datos.get("moneda");
	const metodo = String(datos.get("metodo") || "");
	const destino = String(datos.get("metodoDestino") || "");
	const concepto = String(datos.get("concepto") || "").trim();
	const monto = Number(datos.get("monto"));
	const montoInput = document.querySelector("#monto-movimiento");
	montoInput.setCustomValidity("");

	if (!["ingreso", "gasto", "transferencia"].includes(tipo)
		|| !["USD", "Bs"].includes(moneda) || !concepto
		|| !Number.isFinite(monto) || monto <= 0) {
		montoInput.setCustomValidity(monto <= 0 || !Number.isFinite(monto)
			? "El monto debe ser un número mayor que cero."
			: "Revisa el tipo, la moneda y el concepto del movimiento.");
		montoInput.reportValidity();
		return;
	}
	if (!METODOS_PAGO.some((metodoPago) => metodoPago.value === metodo)) {
		metodoMovimiento.setCustomValidity("Selecciona un método de pago válido.");
		metodoMovimiento.reportValidity();
		return;
	}
	if (tipo === "transferencia") {
		if (!METODOS_PAGO.some((metodoPago) => metodoPago.value === destino) || destino === metodo) {
			metodoDestino.setCustomValidity("Selecciona un canal destino diferente del origen.");
			metodoDestino.reportValidity();
			return;
		}
	}

	const tasaCambio = obtenerTasaCambio(fecha);
	if (!tasaCambio) {
		fechaTasa.value = fecha;
		actualizarEstadoTasa();
		return;
	}

	const movimientos = obtenerMovimientos();
	const montoUSD = moneda === "USD" ? monto : redondearImporte(monto / tasaCambio);
	const montoBs = moneda === "Bs" ? monto : redondearImporte(monto * tasaCambio);
	const idMovimiento = globalThis.crypto?.randomUUID?.() || `mov-${Date.now()}-${Math.random().toString(36).slice(2)}`;
	const usuario = obtenerUsuarioActual();
	movimientos.push({
		id: idMovimiento,
		fecha,
		tipo,
		concepto,
		monto,
		moneda,
		metodo,
		metodoDestino: tipo === "transferencia" ? destino : "",
		montoUSD,
		montoBs,
		tasaCambio,
		usuario,
		creadoEn: new Date().toISOString(),
		responsable: usuario,
	});
	localStorage.setItem(`movimientos-${sedeActual}`, JSON.stringify(movimientos));
	guardarEventoAuditoria({
		accion: "Crear movimiento",
		detalle: `${concepto} · ${tipo} · ${monto} ${moneda}`,
		movimientoId: idMovimiento,
	});
	formularioMovimiento.reset();
	fechaMovimiento.value = obtenerFechaActual();
	actualizarCamposTransferencia();
	actualizarEstadoConversion();
	actualizarVistaCuentas();
});

formularioTasa.addEventListener("submit", (evento) => {
	evento.preventDefault();
	if (!formularioTasa.reportValidity()) return;

	const fecha = fechaTasa.value;
	const tasa = Number(valorTasa.value);
	if (!fecha || !Number.isFinite(tasa) || tasa <= 0) return;

	const tasas = obtenerTasasCambio();
	tasas[fecha] = tasa;
	localStorage.setItem(CLAVE_TASAS_CAMBIO, JSON.stringify(tasas));
	actualizarEstadoTasa();
});

fechaCierre.addEventListener("change", mostrarCierreCaja);
guardarCierre.addEventListener("click", () => {
	if (!sedeSeleccionada || !sedeActual || !fechaCierre.value) return;
	const entradas = Array.from(cierreCajaCuerpo.querySelectorAll(".entrada-cierre"));
	const entradaInvalida = entradas.find((entrada) => !entrada.checkValidity());
	if (entradaInvalida) {
		entradaInvalida.reportValidity();
		return;
	}

	const cierreDia = {};
	cierreCajaCuerpo.querySelectorAll("tr[data-metodo]").forEach((fila) => {
		const valor = (tipo, moneda) => {
			const entrada = fila.querySelector(`[data-tipo="${tipo}"][data-moneda="${moneda}"]`);
			return entrada.value === "" ? null : Number(entrada.value) || 0;
		};
		cierreDia[fila.dataset.metodo] = {
			apertura: { USD: valor("apertura", "USD") || 0, Bs: valor("apertura", "Bs") || 0 },
			contado: { USD: valor("contado", "USD"), Bs: valor("contado", "Bs") },
		};
	});

	const cierres = obtenerCierresCaja();
	cierres[fechaCierre.value] = cierreDia;
	localStorage.setItem(`cierres-${sedeActual}`, JSON.stringify(cierres));
	mostrarCierreCaja();
	estadoCierre.textContent = `Arqueo guardado para ${fechaCierre.value}.`;
});

fechaTasa.addEventListener("change", actualizarEstadoTasa);
fechaMovimiento.addEventListener("change", actualizarEstadoConversion);
tipoMovimiento.addEventListener("change", () => {
	metodoDestino.setCustomValidity("");
	actualizarCamposTransferencia();
	actualizarEstadoConversion();
});
metodoMovimiento.addEventListener("change", () => metodoMovimiento.setCustomValidity(""));
metodoDestino.addEventListener("change", () => metodoDestino.setCustomValidity(""));
monedaMovimiento.addEventListener("change", actualizarEstadoConversion);
montoMovimiento.addEventListener("input", (evento) => {
	evento.currentTarget.setCustomValidity("");
	actualizarEstadoConversion();
});

botonesSemana.forEach((boton) => {
	boton.addEventListener("click", () => {
		botonesSemana.forEach((elemento) => elemento.classList.remove("activo"));
		boton.classList.add("activo");
		seccionNuevoMovimiento.hidden = boton.dataset.semana === "pasada";
		actualizarResumen(boton.dataset.semana === "pasada" ? 1 : 0);
	});
});

botonesMonedaGrafico.forEach((boton) => {
	boton.addEventListener("click", () => {
		monedaGrafico = boton.dataset.monedaGrafico;
		botonesMonedaGrafico.forEach((elemento) => {
			const activo = elemento === boton;
			elemento.classList.toggle("activa", activo);
			elemento.setAttribute("aria-pressed", String(activo));
		});
		const semanasAtras = document.querySelector(".boton-semana.activo").dataset.semana === "pasada" ? 1 : 0;
		mostrarGraficoSemanal(semanasAtras);
	});
});

cambiarMonedaBalance.addEventListener("click", () => {
	balanceEnBolivares = !balanceEnBolivares;
	actualizarResumen(document.querySelector(".boton-semana.activo").dataset.semana === "pasada" ? 1 : 0);
});

abrirUsuarios.addEventListener("click", abrirPanelUsuarios);
cerrarDialogoUsuarios.addEventListener("click", () => dialogoUsuarios.close());
revisarTransacciones.addEventListener("click", () => {
	if (!esAdministrador() || !usuarioRevisado) return;
	mostrarRevisionUsuario();
});
	guardarRolUsuario.addEventListener("click", async () => {
	if (!esAdministrador() || !usuarioRevisado || usuarioRevisado === obtenerUsuarioActual()) return;
	try {
		await window.marinoBackend.solicitar("/api/admin/users/role", {
			method: "POST",
			body: JSON.stringify({ username: usuarioRevisado, role: selectorRolUsuario.value }),
		});
		await actualizarListaUsuarios();
		mostrarDetalleUsuario(usuarioRevisado);
	} catch (error) {
		estadoListaUsuarios.textContent = error.message;
	}
});
	bloquearUsuario.addEventListener("click", async () => {
	if (!esAdministrador() || !usuarioRevisado || usuarioRevisado === obtenerUsuarioActual()) return;
	const estabaBloqueado = Boolean(usuariosBackend.get(usuarioRevisado)?.blocked);
	try {
		await window.marinoBackend.solicitar("/api/admin/users/block", {
			method: "POST",
			body: JSON.stringify({ username: usuarioRevisado, blocked: !estabaBloqueado }),
		});
		await actualizarListaUsuarios();
		mostrarDetalleUsuario(usuarioRevisado);
	} catch (error) {
		estadoListaUsuarios.textContent = error.message;
	}
});
dialogoUsuarios.addEventListener("click", (evento) => {
	if (evento.target === dialogoUsuarios) dialogoUsuarios.close();
});

aplicarPermisosUsuario();
actualizarCamposTransferencia();
inicializarCuentas();
