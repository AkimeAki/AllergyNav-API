/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import test from "@/routes/test";
import getStore from "@/routes/store/get";
import getStoreList from "@/routes/store/get-list";
import putStore from "@/routes/store/put";
import postStore from "@/routes/store/post";
import postSession from "@/routes/session/post";
import getMenuList from "@/routes/menu/get-list";
import postMenu from "@/routes/menu/post";

const router = express.Router();
router.get("/test", test);
router.get("/store", getStoreList);
router.get("/store/:id", getStore);
router.put("/store/:id", putStore);
router.post("/store", postStore);
router.post("/session", postSession);
router.get("/menu", getMenuList);
router.post("/menu", postMenu);

export default router;
