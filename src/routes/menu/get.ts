import mysql from "mysql2/promise";
import type { RowDataPacket } from "mysql2/promise";
import type express from "express";
import { devMysqlConfig, NotFoundError } from "@/definition";
import type { ApiMessage, Menu } from "@/type";

interface MenuRow extends Menu, RowDataPacket {}

export default async function (req: express.Request, res: express.Response): Promise<void> {
	let connection: mysql.Connection | null = null;
	let status = 500;
	const messages: ApiMessage[] = [];
	let data: Menu = {};

	const menuId = Number(req.params.id);

	try {
		connection = await mysql.createConnection(devMysqlConfig);

		const [rows] = await connection.query<MenuRow[]>(
			/* sql */ `
				SELECT
					menu.id as id,
					menu.name as name,
					menu.store_id as store_id,
					menu.chain_id as chain_id,
					menu.updated_at as updated_at,
					menu.created_at as created_at
				FROM menu
				LEFT JOIN menu_allergens ON menu.id = menu_allergens.menu_id
				LEFT JOIN allergens ON menu_allergens.allergen_id = allergens.id
				WHERE menu.id = ?
			`,
			[menuId]
		);

		if (rows[0] !== undefined && rows.length !== 0) {
			data = rows[0];
		} else {
			throw new NotFoundError();
		}

		messages.push({
			status: "success",
			message: "メニューが見つかりました。"
		});
		status = 200;
	} catch (e) {
		messages.splice(0);

		if (e instanceof NotFoundError) {
			messages.push({
				status: "error",
				message: "メニューが見つかりませんでした。"
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
