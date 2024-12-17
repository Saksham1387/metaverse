import z from "zod";

export const signupSchema = z.object({
  username: z.string(),
  password: z.string(),
  type: z.enum(["admin", "user"]),
});

export const signinSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const updateMetadataSchema = z.object({
  avatarId: z.string(),
});

export const CreateSpaceSchema = z.object({
  name: z.string(),
  dimensions: z.string().regex(/^[0-9]{1,5}x[0-9]{1,5}$/),
  mapId: z.string(),
});

export const addElementSchema = z.object({
  elementId: z.string(),
  spaceId: z.string(),
  x: z.number(),
  y: z.number(),
});




export const deleteElementSchema = z.object({
  id: z.string(),
 
});


export const createElementSchema = z.object({
  imageUrl: z.string(),
  width: z.number(),
  height: z.number(),
  static: z.boolean(),
});

export const updateElementSchema = z.object({
  imageUrl: z.string(),
});
export const createAvatarSchema = z.object({
  name: z.string(),
  imageUrl: z.string(),
});

export const createMapSchema = z.object({
  name: z.string(),
  thumbnail: z.string(),
  dimensions: z.string().regex(/^[0-9]{1,5}x[0-9]{1,5}$/),
  defaultElements: z.array(
    z.object({
      elementId: z.string(),
      x: z.number(),
      y: z.number(),
    })
  ),
});
