import type express from "express";

export default async function (req: express.Request, res: express.Response): Promise<void> {
	req.session.inputAddStoreForm = true;
	console.log(req.session);
	console.log(req.sessionID);
	res.status(200).json({ message: "test" });
}
