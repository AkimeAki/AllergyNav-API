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
	let data: Stores[] = [];

	const allergen = req.query.allergen;
	const keywords = req.query.keywords;

	try {
		connection = await mysql.createConnection(devMysqlConfig);

		const baseSql = /* sql */ `
			SELECT DISTINCT
				stores.id as id,
				stores.name as name,
				stores.chain_id as chain_id,
				stores.updated_at as updated_at,
				stores.created_at as created_at
			FROM stores
			LEFT JOIN menu ON stores.id = menu.store_id
			LEFT JOIN menu_allergens ON menu.id = menu_allergens.menu_id
			LEFT JOIN allergens ON menu_allergens.allergen_id = allergens.id
		`;

		let filterSql = "";
		if (typeof keywords === "string") {
			const keywordList = keywords.split(" ");
			keywordList.forEach((keyword) => {
				filterSql += `stores.name LIKE "%${keyword}%"`;
				filterSql += " OR ";
				filterSql += `menu.name LIKE "%${keyword}%"`;
				filterSql += " OR ";
			});
		}

		if (typeof allergen === "string") {
			const allergenList = allergen.split(",");
			allergenList.forEach((id) => {
				filterSql += `allergens.id = "${id}"`;
				filterSql += " OR ";
			});
		}

		if (filterSql !== "") {
			filterSql = filterSql.replace(/\sOR\s$/, "");
		}

		const [rows] = await connection.query<StoresRow[]>(
			`${baseSql} ${filterSql !== "" ? `WHERE ${filterSql}` : ""}`
		);

		data = rows;

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
