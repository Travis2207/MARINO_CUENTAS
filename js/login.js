const claveUsuarioSesion = "marinoUsuarioActual";
const claveRolSesion = "marinoRolActual";
const esPaginaLogin = window.location.pathname.endsWith("/client/login.html");

window.marinoSesionLista = esPaginaLogin
	? Promise.resolve(null)
	: window.marinoBackend.solicitar("/api/session")
		.then((sesion) => {
			sessionStorage.setItem(claveUsuarioSesion, sesion.username);
			sessionStorage.setItem(claveRolSesion, sesion.role);
			return sesion;
		})
		.catch(() => {
			sessionStorage.removeItem(claveUsuarioSesion);
			sessionStorage.removeItem(claveRolSesion);
			window.location.replace("/client/login.html");
			return null;
		});

const configurarLogin = () => {
	const formularioLogin = document.querySelector("#login-form");
	const botonCerrarSesion = document.querySelector("#cerrar-sesion");

	if (formularioLogin) {
		formularioLogin.addEventListener("submit", async (event) => {
			event.preventDefault();
			const usuario = document.querySelector("#usuario").value;
			const contrasena = document.querySelector("#contrasena").value;
			const nombre = document.querySelector("#nombre").value;
			const loginStatus = document.querySelector("#login-status");
			loginStatus.textContent = "Verificando acceso…";
			try {
				const sesion = await window.marinoBackend.iniciarSesion({
					username: usuario,
					password: contrasena,
					fullName: nombre,
				});
				sessionStorage.setItem(claveUsuarioSesion, sesion.username);
				sessionStorage.setItem(claveRolSesion, sesion.role);
				window.location.href = "../index.html";
			} catch (error) {
				loginStatus.textContent = error.message === "Failed to fetch"
					? "No se pudo conectar con el backend local. Inícialo y vuelve a intentarlo."
					: error.message;
			}
		});
	}

	if (botonCerrarSesion) {
		botonCerrarSesion.addEventListener("click", async () => {
			try {
				await window.marinoBackend.cerrarSesion();
			} finally {
			sessionStorage.removeItem(claveUsuarioSesion);
			sessionStorage.removeItem(claveRolSesion);
				window.location.replace("/client/login.html");
			}
		});
	}
};

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", configurarLogin, { once: true });
} else {
	configurarLogin();
}
