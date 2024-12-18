import { Router } from "express";
import {
  addElementSchema,
  CreateSpaceSchema,
  deleteElementSchema,
} from "../../types";
import client from "@repo/db/client";
import { userMiddleware } from "../../middlewares/user";

export const spaceRouter = Router();

spaceRouter.post("/", userMiddleware, async (req, res) => {
  const parsedData = CreateSpaceSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid data" });
    return;
  }

  if (!parsedData.data.mapId) {
    const space = await client.space.create({
      data: {
        name: parsedData.data.name,
        width: parseInt(parsedData.data.dimensions.split("x")[0]),
        height: parseInt(parsedData.data.dimensions.split("x")[1]),
        creatorId: req.userId,
      },
    });

    res.json({
      message: "space-created",
      spaceId: space.id,
    });
    return;
  }

  const map = await client.map.findUnique({
    where: {
      id: parsedData.data.mapId,
    },
    select: {
      mapElements: true,
      width: true,
      height: true,
    },
  });
  if (!map) {
    res.status(400).json({ message: "Invalid mapId" });
    return;
  }

  const space = await client.$transaction(async () => {
    const sapce = await client.space.create({
      data: {
        name: parsedData.data.name,
        width: map.width,
        height: map.height,
        creatorId: req.userId,
      },
    });

    await client.spaceElements.createMany({
      data: map.mapElements.map((e) => {
        return {
          elementId: e.elementId,
          spaceId: sapce.id,
          x: e.x!,
          y: e.y!,
        };
      }),
    });

    return sapce;
  });

  res.json({
    message: "space-created",
    spaceId: space.id,
  });
  return;
});

spaceRouter.delete("/:spaceId", userMiddleware, async (req, res) => {
  const spaceId = req.params.spaceId;
  const space = await client.space.findUnique({
    where: {
      id: spaceId,
    },
    select: {
      creatorId: true,
    },
  });
  if (!space) {
    res.status(400).json({ message: "Invalid spaceId" });
    return;
  }
  if (space.creatorId !== req.userId) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  await client.space.delete({
    where: {
      id: spaceId,
    },
  });

  res.json({
    message: "space-deleted",
  });
});

spaceRouter.get("/all", userMiddleware, async (req, res) => {
  const spaces = await client.space.findMany({
    where: {
      creatorId: req.userId,
    },
  });

  res.json({
    spaces: spaces.map((space) => {
      return {
        id: space.id,
        name: space.name,
        thumbnail: space.thumbnail,
        dimensions: `${space.width}x${space.height}`,
      };
    }),
  });
});

spaceRouter.post("/element", userMiddleware, async (req, res) => {
  const parsedData = addElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid data" });
    return;
  }

  const space = await client.space.findUnique({
    where: {
      id: req.body.spaceId,
      creatorId: req.userId,
    },
    select: {
      width: true,
      height: true,
    },
  });

  if (!space) {
    res.status(400).json({ message: "Invalid spaceId" });
    return;
  }
  await client.spaceElements.create({
    data: {
      elementId: req.body.elementId,
      spaceId: req.body.spaceId,
      x: req.body.x,
      y: req.body.y,
    },
  });
  res.json({
    message: "element-added",
  });
});

spaceRouter.delete("/element", userMiddleware, async (req, res) => {
  console.log("spaceElement?.space1 ")
  const parsedData = deleteElementSchema.safeParse(req.body)
  if (!parsedData.success) {
      res.status(400).json({message: "Validation failed"})
      return
  }
  const spaceElement = await client.spaceElements.findFirst({
      where: {
          id: parsedData.data.id
      }, 
      include: {
          space: true
      }
  })
  console.log(spaceElement?.space)
  console.log("spaceElement?.space")
  if (!spaceElement?.space.creatorId || spaceElement.space.creatorId !== req.userId) {
      res.status(403).json({message: "Unauthorized"})
      return
  }
  await client.spaceElements.delete({
      where: {
          id: parsedData.data.id
      }
  })
  res.json({message: "Element deleted"})
})

spaceRouter.get("/:spaceId",async (req, res) => {
  const space = await client.space.findUnique({
      where: {
          id: req.params.spaceId
      },
      include: {
          elements: {
              include: {
                  element: true
              }
          },
      }
  })

  if (!space) {
      res.status(400).json({message: "Space not found"})
      return
  }

  res.json({
      "dimensions": `${space.width}x${space.height}`,
      elements: space.elements.map(e => ({
          id: e.id,
          element: {
              id: e.element.id,
              imageUrl: e.element.imageUrl,
              width: e.element.width,
              height: e.element.height,
              static: e.element.static
          },
          x: e.x,
          y: e.y
      })),
  })
})
