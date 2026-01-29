import { type Request, Router } from "express";

import { verifyAuthToken } from "../validators/auth";

const router = Router();

type AuthedRequest = Request & { user: unknown };

router.get("/", verifyAuthToken, (req, res) => {
  const _user = (req as AuthedRequest).user;

  res.json({ ok: true, response: "hello world" });
});

export default router;
