import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prismadb from "@/lib/prismaDB"
import { signJwt } from "@/lib/jwt"
import logger from "@/lib/logger"


export async function POST(req :Request) {
    try {
        const { username, email, password } = await req.json()

        const id = username || email
        const user = await prismadb.user.findFirst({ 
            where: {
                OR: [
                 { email: id },
                 { username: id }   
                ]
            }
        })
        if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

        const Valid = await bcrypt.compare(password, user.password);
        if(!Valid) return NextResponse.json({error: "Invalid Password"}, { status: 401 })

        const token = signJwt({userId: user.id});

        logger.info({ userId: user.id }, "User logged in");

        const res = NextResponse.json({message: "Login successful!"})
        res.cookies.set("token", token, { httpOnly: true, path: "/", maxAge: 60*60*24*7 });
        return res;
    } catch (error) {
        logger.error({ error }, "Login error");
        return NextResponse.json({ error: "Login failed!" }, { status: 500 });
    }
}