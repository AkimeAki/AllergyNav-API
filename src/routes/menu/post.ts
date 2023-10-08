import mysql from "mysql2/promise";
import type express from "express";
import { devMysqlConfig } from "@/definition";
import type { ApiMessage, Menu } from "@/type";

export default async function (req: express.Request, res: express.Response): Promise<void> {
	let connection: mysql.Connection | null = null;
	let status = 500;
	const messages: ApiMessage[] = [];
	const data: Menu = {};

	const name: string = req.body.name;
	const allergens: string = req.body.allergens;
	const storeId: number = parseInt(req.body.storeId);
	console.log(req.body.storeId);

	try {
		connection = await mysql.createConnection(devMysqlConfig);

		await connection.beginTransaction();
		const [menuResult] = await connection.query(
			/* sql */ `
				INSERT INTO menu SET ?
			`,
			{
				name,
				store_id: storeId
			}
		);

		if (!Array.isArray(menuResult)) {
			data.id = menuResult.insertId;
		} else {
			throw new Error();
		}

		const allergenList = JSON.parse(allergens) as string[];
		if (allergenList.length !== 0) {
			const menuAllergens: Array<string | number> = [];

			allergenList.forEach((allergen) => {
				menuAllergens.push(allergen);
				menuAllergens.push(data.id as number);
			});

			let value = "";
			for (let i = 0; i < allergenList.length; i++) {
				value += "(?, ?), ";
			}

			value = value.replace(/,\s$/, "");

			await connection.query(
				/* sql */ `
					INSERT INTO menu_allergens (allergen_id, menu_id) VALUES ${value}
				`,
				menuAllergens
			);
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

		console.log(e);

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
