import type { Request, Response } from "express";
import type { ApiMessage } from "@/type";

export default async function (req: Request, res: Response): Promise<void> {
	const messages: ApiMessage[] = [];
	req.session.inputAddStoreForm = true;
	res.status(200).json({ data: req.session, messages });
}
