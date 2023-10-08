import mysql from "mysql2/promise";
import type express from "express";
import { devMysqlConfig } from "@/definition";
import type { ApiMessage, Stores } from "@/type";

export default async function (req: express.Request, res: express.Response): Promise<void> {
	let connection: mysql.Connection | null = null;
	let status = 500;
	const messages: ApiMessage[] = [];
	const data: Stores = {};

	const name: string = req.body.name;
	const address: string = req.body.address;

	try {
		connection = await mysql.createConnection(devMysqlConfig);

		await connection.beginTransaction();
		const [result] = await connection.query(
			/* sql */ `
				INSERT INTO stores SET ?
			`,
			{
				name,
				address
			}
		);

		if (!Array.isArray(result)) {
			data.id = result.insertId;
		}
		await connection.commit();

		messages.push({
			status: "success",
			message: "お店を登録できました。"
		});
		status = 200;
	} catch (e) {
		if (connection !== null) {
			await connection.rollback();
		}

		messages.splice(0);
		messages.push({
			status: "error",
			message: "お店が登録できませんでした。"
		});
	}

	if (connection !== null) {
		await connection.end();
	}

	res.status(status).json({ data, messages });
}
