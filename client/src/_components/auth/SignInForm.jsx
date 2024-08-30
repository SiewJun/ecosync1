import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const SignInForm = () => {
  const [showPassword, setShowPassword] = useState(false); // Add state to toggle password visibility

  return (
    <div className="flex w-full flex-col lg:flex-row min-h-[700px]">
      <div className="flex flex-1 items-center justify-center lg:w-1/2">
        <div className="mx-auto w-[350px] space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-muted-foreground">
              Enter your credentials below to login to your account.
            </p>
          </div>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ecosync@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"} // Toggle type between text and password
                  placeholder="Your password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex flex-col space-y-4">
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
          <div className="text-center text-sm mt-4">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>

      <div className="relative hidden lg:block lg:w-1/2">
        <img
          src="/loginhero.svg"
          alt="Login Hero Image"
          style={{ objectFit: "cover" }}
          className="h-full w-full object-cover dark:brightness-[0.6]"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-center text-white p-4">
          <img
            src="/ecosync.svg"
            alt="EcoSync Logo"
            className="mb-6"
            width={100}
            height={100}
          />
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="text-lg mt-2 max-w-[80%]">
            Access your green energy solutions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
