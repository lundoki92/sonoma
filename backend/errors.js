// Une erreur « prévue », qui connaît son code HTTP.
// Le service la lance, le middleware d'erreurs la transforme en réponse.
export class ErrorHttp extends Error {
	constructor(status, message, details) {
		super(message);
		this.status = status;
		this.details = details;
	}
}