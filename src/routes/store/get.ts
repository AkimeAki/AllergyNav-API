import mysql from "mysql2/promise";
import type { RowDataPacket } from "mysql2/promise";
import type express from "express";
import { devMysqlConfig, NotFoundError } from "@/definition";
import type { ApiMessage, Stores } from "@/type";

interface StoresRow extends Stores, RowDataPacket {}

export default async function (req: express.Request, res: express.Response): Promise<void> {
	let connection: mysql.Connection | null = null;
	let status = 500;
	const messages: ApiMessage[] = [];
	let data: Stores = {};

	const storeId = Number(req.params.id);

	try {
		connection = await mysql.createConnection(devMysqlConfig);

		const [rows] = await connection.query<StoresRow[]>(
			"SELECT id, name, address, chain_id, updated_at, created_at FROM stores WHERE id = ?",
			[storeId]
		);

		if (rows[0] !== undefined && rows.length !== 0) {
			data = rows[0];
		} else {
			throw new NotFoundError();
		}

		messages.push({
			status: "success",
			message: "お店が見つかりました。"
		});
		status = 200;
	} catch (e) {
		messages.splice(0);

		if (e instanceof NotFoundError) {
			messages.push({
				status: "error",
				message: "お店が見つかりませんでした。"
			});

			status = 404;
		} else {
			messages.push({
				status: "error",
				message: "何かしらのエラーが発生しました。"
			});
		}
	}

	if (connection !== null) {
		await connection.end();
	}

	res.status(status).json({ data, messages });
}
