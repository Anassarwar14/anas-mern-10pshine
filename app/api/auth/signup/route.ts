import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prismadb from "@/lib/prismaDB";
import logger from "@/lib/logger";
import { signJwt } from "@/lib/jwt";


function generateUsername(firstName: string) {
  const randomCode = Math.floor(1000 + Math.random() * 9000); // 4-digit number
  return `${firstName.toLowerCase()}${randomCode}`;
}

export async function POST(req: Request) {
    try {
        const { firstName, lastName, bio, email, password } = await req.json();
        const hashedPassword = await bcrypt.hash(password, 10)

        const username = generateUsername(firstName) 
        const user = await prismadb.user.create({
            data: { 
                username,
                firstName,
                lastName,
                bio,
                email,
                password: hashedPassword
            }
        })

        logger.info({userId: user.id}, 'User signed up!')
        
        const token = signJwt({userId: user.id});
        
        logger.info({ userId: user.id }, "User signed in");
        
        const res = NextResponse.json({message: "User created and login successful!"}, { status: 201 })
        res.cookies.set("token", token, { httpOnly: true, path: "/", maxAge: 60*60*24*7 });
        return res;
        
    } catch (error: any) {
        logger.error({ error: error.message }, "Signup error");
        return NextResponse.json({ error: "Signup failed!" }, {status: 500})
    }
}