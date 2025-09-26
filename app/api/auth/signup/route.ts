import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prismadb from "@/lib/prismaDB";
import logger from "@/lib/logger";


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
        return NextResponse.json({ message: "User created" }, { status: 201 })

    } catch (error: any) {
        logger.error({ error }, "Signup error");
        return NextResponse.json({ error: "Signup failed!" }, {status: 500})
    }
}