import { Router } from "express";
import { updateMetadataSchema } from "../../types";
import { userMiddleware } from "../../middlewares/user";
import client from "@repo/db/client";
export const userRouter = Router();

userRouter.post("/metadata", userMiddleware, async (req, res) => {
  const parsedData = updateMetadataSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid data" });
    return;
  }
  try {
    await client.user.update({
        where: {
            id: req.userId
        },
        data: {
            avatarId: parsedData.data.avatarId
        }
    })
    res.json({message: "Metadata updated"})
} catch(e) {
    console.log("error")
    res.status(400).json({message: "Internal server error"})
}
});

userRouter.get("/metadata/bulk", async (req, res) => {
  const userIdsString = (req.query.ids ?? "[]") as string;
  const userIds = userIdsString.slice(1, userIdsString?.length - 1).split(",");
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
