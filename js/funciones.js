const selectorSedesVista = document.querySelector(".selector-sedes");
const panelCuentasVista = document.querySelector(".panel-cuentas");
const bienvenidaTituloVista = document.querySelector("#bienvenida-titulo");

document.querySelectorAll(".sede-opcion").forEach((opcion) => {
	opcion.addEventListener("click", () => {
		const sede = opcion.dataset.sede;
		bienvenidaTituloVista.textContent = `Bienvenido a la sede ${sede}`;
		selectorSedesVista.hidden = true;
		panelCuentasVista.hidden = false;
		document.dispatchEvent(new CustomEvent("cuentas:sede-seleccionada", { detail: { sede } }));
		panelCuentasVista.scrollIntoView({ behavior: "smooth", block: "start" });
	});
});

document.querySelector("#cambiar-sede").addEventListener("click", () => {
	panelCuentasVista.hidden = true;
	selectorSedesVista.hidden = false;
	document.dispatchEvent(new Event("cuentas:sede-cambiada"));
	selectorSedesVista.scrollIntoView({ behavior: "smooth", block: "start" });
});
