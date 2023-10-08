import express from "express";
import router from "@/router";
import * as session from "express-session";
import mySqlSessionStore from "express-mysql-session";
import { devMysqlConfig } from "./definition";

declare module "express-session" {
	export interface SessionData {
		inputAddStoreForm?: boolean;
	}
}

const app: express.Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((_req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "*");
	res.header("Access-Control-Allow-Headers", "*");
	next();
});

// 末尾スラッシュは404
app.use((req, res, next) => {
	if (req.path.slice(-1) === "/" && req.path.length > 1) {
		res.status(404).json({ message: "404" });
	} else {
		next();
	}
});

const MySQLStore = mySqlSessionStore(session);

app.use(
	session.default({
		secret: "secret",
		cookie: { maxAge: 86400 },
		store: new MySQLStore({
			...devMysqlConfig,
			schema: {
				tableName: "sessions",
				columnNames: {
					session_id: "session_id",
					expires: "expires",
					data: "data"
				}
			}
		}),
		resave: false,
		saveUninitialized: false
	})
);

app.use(router);

app.listen(5002, () => {
	console.log("Start on port 5002.");
});
