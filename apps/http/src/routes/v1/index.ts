import { Router } from "express";
import { spaceRouter } from "./space";
import { userRouter } from "./user";
import { adminRouter } from "./admin";
import client from "@repo/db/client";
import { signinSchema, signupSchema } from "../../types";

import jwt from "jsonwebtoken";
import { compare, hash } from "../../script";

export const router = Router();

router.post("/signup", async (req, res) => {
  const parsedData = signupSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid data" });
    return;
  }
  const hashedPassword = await hash(parsedData.data.password);
  try {
    const user = await client.user.create({
      data: {
        username: parsedData.data.username,
        password: hashedPassword,
        role: parsedData.data.type === "admin" ? "Admin" : "User",
      },
    });
    res.json({
      userId: user.id,
    });
  } catch (e) {
    res.status(400).json({ message: "user already exists" });
    return;
  }
});

router.post("/signin", async (req, res) => {
  const parsedData = signinSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(403).json({ message: "Invalid data" });
    return;
  }
  try {
    const user = await client.user.findUnique({
      where: {
        username: parsedData.data.username,
      },
    });
    if (!user) {
      res.status(403).json({ message: "user not found" });
      return;
    }
    const isValid = await compare(parsedData.data.password, user.password);
    if (!isValid) {
      res.status(403).json({ message: "invalid password" });
      return;
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, "secret");
    res.json({
      token,
    });
  } catch (e) {
    res.status(400).json({ message: "user not found" });
    return;
  }
});

router.get("/elements", async (req, res) => {
  const elements = await client.element.findMany({});
  res.json({
    elements: elements.map((x) => ({
      id: x.id,
      imageUrl: x.imageUrl,
      width: x.width,
      height: x.height,
      static: x.static,
    })),
  });
});

router.get("/avatars", async (req, res) => {
  const avatars = await client.avatar.findMany({
    select: {
      id: true,
      imageUrl: true,
      name: true,
    },
  });
  res.json({
    avatars: avatars.map((x) => ({
      id: x.id,
      imageUrl: x.imageUrl,
      name: x.name,
    })),
  });
});

router.use("/space", spaceRouter);
router.use("/user", userRouter);
router.use("/admin", adminRouter);
