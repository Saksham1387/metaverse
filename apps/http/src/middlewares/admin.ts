declare global{
    namespace Express{
        interface Request{
            role:"Admin" | "User"
            userId: string
        }
    }
}


import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
export const adminMiddleware = (req:Request, res:Response, next:NextFunction) => {
    const header = req.headers["authorization"]
    const token = header?.split(" ")[1];
    if(!token){
        res.status(403).json({ message: "Unauthorized" })
        return
    }
    try{
        const decoded = jwt.verify(token, "secret") as {role: string,userId: string}
        if(decoded.role !== "Admin"){
            res.status(403).json({ message: "Unauthorized" })
            return
        }
        req.userId = decoded.userId
        next()

    }catch(e){
        res.status(401).json({ message: "Unauthorized" })
        return
    }
}