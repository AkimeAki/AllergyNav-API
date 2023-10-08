export const devMysqlConfig = {
	host: "db",
	user: "root",
	password: "root",
	database: "dev"
};

export class NotFoundError extends Error {
	constructor(message?: string) {
		super(message);
		this.name = "HttpError";
	}
}
