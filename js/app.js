const scriptApp = document.currentScript;

const insertarScriptCuentas = () => {
	const scriptCuentas = document.createElement("script");
	scriptCuentas.src = new URL("./cuentas.js", scriptApp.src).href;
	scriptApp.after(scriptCuentas);
};

if (window.marinoSesionLista) {
	window.marinoSesionLista.then((sesion) => {
		if (sesion) insertarScriptCuentas();
	});
} else {
	insertarScriptCuentas();
}
