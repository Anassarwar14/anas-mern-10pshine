import jwt from "jsonwebtoken";


const SECRET = process.env.JWT_SECRET!;


export function signJwt(payload: object){
    return jwt.sign(payload, SECRET, { expiresIn: "7d" })
}

export function verifyJwt(token: string){
    return jwt.verify(token, SECRET)
}