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
	let data: Menu[] = [];

	const storeId = req.query.storeId;

	try {
		connection = await mysql.createConnection(devMysqlConfig);

		const baseSql = /* sql */ `
			SELECT DISTINCT
				menu.id as id,
				menu.name as name,
				menu.store_id as store_id,
				menu.chain_id as chain_id,
				menu.updated_at as updated_at,
				menu.created_at as created_at,
				allergens.id as allergen_id,
				allergens.name as allergen_name
			FROM menu
			LEFT JOIN menu_allergens ON menu.id = menu_allergens.menu_id
			LEFT JOIN allergens ON menu_allergens.allergen_id = allergens.id
		`;

		let filterSql = "";
		if (typeof storeId === "string") {
			filterSql += `menu.store_id = ${storeId}`;
		}

		const [rows] = await connection.query<MenuRow[]>(`${baseSql} ${filterSql !== "" ? `WHERE ${filterSql}` : ""}`);

		const ids = [...new Set(rows.map((row) => row.id))];
		ids.forEach((id) => {
			if (id === undefined) {
				return;
			}

			const allergens: Menu["allergens"] = [];

			rows.forEach((row) => {
				if (row.id === id) {
					allergens.push({
						id: row.allergen_id,
						name: row.allergen_name
					});
				}
			});

			let name;
			let storeId;
			let chainId;
			let createdAt;
			let updatedAt;

			rows.forEach((row) => {
				if (row.id === id) {
					name = row.name;
					storeId = row.store_id;
					chainId = row.chain_id;
					createdAt = row.created_at;
					updatedAt = row.updated_at;
				}
			});

			data.push({
				id,
				name,
				store_id: storeId,
				chain_id: chainId,
				updated_at: updatedAt,
				created_at: createdAt,
				allergens
			});
		});

		messages.push({
			status: "success",
			message: "お店が見つかりました。"
		});
		status = 200;
	} catch (e) {
		messages.splice(0);
		data = [];

		if (e instanceof NotFoundError) {
			messages.push({
				status: "error",
				message: "お店が見つかりませんでした。"
			});

			status = 404;
		} else {
			console.log(e);
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
