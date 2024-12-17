import { Router } from "express";
import { updateMetadataSchema } from "../../types";
import { userMiddleware } from "../../middlewares/user";
import client from "@repo/db/client";
export const userRouter = Router();

userRouter.post("/metadata", userMiddleware, async (req, res) => {
  const parsedData = updateMetadataSchema.safeParse(req.query);
  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid data" });
    return;
  }
  await client.user.update({
    where: {
      id: req.userId,
    },
    data: {
      avatarId: parsedData.data.avatarId,
    },
  });
  res.json({
    message: "metadata-updated",
  });
});

userRouter.get("/metadata/bulk", async (req, res) => {
  const userIdsString = (req.query.ids ?? "[]") as string;
  const userIds = userIdsString.slice(1, userIdsString?.length - 2).split(",");
  const metadata = await client.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      avatar: true,
      id: true,
    },
  });
  res.json({
    avatars: metadata.map((x) => {
      return {
        userId: x.id,
        imageUrl: x.avatar?.imageUrl,
      };
    }),
  });
});
