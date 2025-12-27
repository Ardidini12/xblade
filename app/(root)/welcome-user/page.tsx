import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/headers";

const WelcomeUser = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  
  const firstName = session?.user?.name?.split(' ')[0] || null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
      <h1 className="text-6xl font-extrabold tracking-widest">
        WELCOME {firstName ? firstName.toUpperCase() : ''}
      </h1>
    </main>
  )
}

export default WelcomeUser