"use client"

import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { LoaderCircle } from "lucide-react";

interface SignUpFormProps {
    mode: String
}

type FormData = {
  firstName?: string
  lastName?: string
  email: string
  password: string
}


const SignUpForm = ({ mode }: SignUpFormProps) => {

  const router = useRouter(); 
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>()
  const [serverError, setServerError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const onSubmit = async (data: FormData) => {
    setServerError('')
    
    try {
      const endpoint = mode === 'login' ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/login` : `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/signup`
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong')
      }

      router.push('/dashboard')
      
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  return (
    <>
      <main className="min-h-screen flex flex-col md:grid md:grid-cols-3">
        <section className="hidden md:block col-span-2 p-2 md:h-screen">
          <div className="overflow-hidden relative h-full rounded-3xl p-6">
            <Image 
              className="-z-10 object-cover object-bottom-left" 
              fill 
              src="https://images.unsplash.com/photo-1601128688653-7dc405e3ac4d?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="logging-bg"
            />
            <div className="absolute inset-0 bg-black/30 -z-10 rounded-3xl"></div>
            <div className="flex items-center gap-4 text-white/90">
              <h2 style={{ fontFamily: 'var(--font-playfair)' }} className="uppercase tracking-wider">Anchor the fleeting wisdom</h2>
              <hr className="w-[10%] rounded-full border-white/60"/>
            </div>
            <div className="absolute bottom-8 left-6 right-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight">
                Your <span style={{ fontFamily: 'var(--font-vibes)' }} className="font-light italic">thoughts</span><span style={{ fontFamily: 'var(--font-playfair)' }}  className="text-rose-700">,</span><br />
                beautifully <span style={{ fontFamily: 'var(--font-playfair)' }} className="font-light tracking wider"> organized</span>
              </h1>
              <p className="text-white/80 text-lg mt-3">
                Capture ideas that matter, anytime, anywhere
              </p>
            </div>
          </div>
        </section>
        <section className="flex flex-col items-center justify-between gap-10 p-6 py-8 md:h-screen md:overflow-y-auto">
          <header className="flex gap-2 items-center justify-center flex-shrink-0">
            <div>
             <Image width={32} height={32} src="/favicon.jpg" alt="logo.png"/>
            </div>
            <h3 style={{ fontFamily: 'var(--font-playfair)' }} className="text-rose-900 text-xl">Orris</h3>
          </header>
          <div className="space-y-2 flex-shrink-0 my-6 md:my-0">
            <h2 className="text-3xl sm:text-4xl text-center">Welcome{mode == 'login' && ' back'}!</h2>
            <p className="text-accent-foreground/40 text-center text-sm">Secure your thoughts and write away.</p>
          </div>
          <form 
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-md grid grid-cols-2 gap-4 text-sm text-zinc-600 form-inputs flex-shrink-0"
          >
            {mode !== 'login' && (
              <>
                <div>
                  <h4>First Name</h4>
                  <input
                    placeholder="John" 
                    type="text" 
                    {...register('firstName', { required: mode === 'signup' })}
                    className="w-full" 
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-500 mt-1">First name is required</p>
                  )}
                </div>
                
                <div>
                  <h4>Last Name</h4>
                  <input 
                    placeholder="Doe"
                    type="text" 
                    {...register('lastName')}
                    className="w-full" 
                  />
                </div>
              </>
            )}
            
            <div className="col-span-2">
              <h4>Email</h4>
              <input 
                placeholder="john@orris.com"
                type="text" 
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="w-full" 
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-2">
                <h4>Password</h4>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="cursor-pointer text-xs text-rose-700 hover:text-rose-800 hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input 
                placeholder="********"
                type="password" 
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  }
                })}
                className="w-full" 
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <div className="col-span-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {serverError}
              </div>
            )}
            
            <Button className="col-span-2 rounded-lg mt-1 cursor-pointer" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="animate-spin" /> : mode === 'login' ? 'Login' : 'Sign Up'}
            </Button>
          </form>

          <footer className="flex-shrink-0 mt-6 md:mt-0">
            {mode == 'login' ? 
              <p className="text-accent-foreground/40 text-sm">Don't have an account? <Link href="/signup" className="text-primary underline hover:underline-offset-4">Sign Up</Link></p>
              :
              <p className="text-accent-foreground/40 text-sm">Already have an account? <Link href="/login" className="text-primary underline hover:underline-offset-4">Sign In</Link></p>
            }
          </footer>
        </section>
      </main>

      <ForgotPasswordModal
        isOpen={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
      />
    </>
  )
}

export default SignUpForm