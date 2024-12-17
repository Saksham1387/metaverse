import { Router } from "express";
import { adminMiddleware } from "../../middlewares/admin";
import { createAvatarSchema, createElementSchema, createMapSchema, updateElementSchema } from "../../types";
import client from "@repo/db/client";
export const adminRouter = Router()

adminRouter.post("/element",adminMiddleware,async(req,res)=>{
        const parsedData = createElementSchema.safeParse(req.body)
        if (!parsedData.success) {
            res.status(400).json({ message: "Invalid data" })
            return
        }
        const element = await client.element.create({
            data:{
                imageUrl: parsedData.data.imageUrl,
                width: parsedData.data.width,
                height: parsedData.data.height,
                static: parsedData.data.static
            }
        })
        res.json({
            id:element.id
        })
})

adminRouter.put("/element/:elementId",adminMiddleware,async(req,res)=>{
    const parsedData = updateElementSchema.safeParse(req.body)
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid data" })
        return
    }
   await client.element.update({
        where:{
            id: req.params.elementId
        },
        data:{
            imageUrl: parsedData.data.imageUrl,
        }
    })
    res.json({
        message: "element-updated"
    })

})

adminRouter.post("/avatar",adminMiddleware,async (req,res)=>{
    const parsedData = createAvatarSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid data" });
        return;
    }
    const avatar = await client.avatar.create({
        data: {
            name: parsedData.data.name,
            imageUrl: parsedData.data.imageUrl,
        },
    });
    res.json({
        avatarId: avatar.id,
    });
})

adminRouter.post("/map",adminMiddleware, async (req,res)=>{
    const parsedData = createMapSchema.safeParse(req.body);

    if (!parsedData.success) {
        res.status(403).json({ message: "Validation failed" });
        return;
    }
    const map = await client.map.create({
        data: {
            name: parsedData.data.name,
            thumbnail: parsedData.data.thumbnail,
            width: parseInt(parsedData.data.dimensions.split("x")[0]),
            height:parseInt(parsedData.data.dimensions.split("x")[1]),
            mapElements: {
                create: parsedData.data.defaultElements.map(e => ({
                    elementId: e.elementId,
                    x: e.x,
                    y: e.y
                }))
            }
        }
    })
    res.json({
        mapId: map.id
    })
})