import {redirect} from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import {getSession} from "@/lib/actions/auth.actions";

const WelcomeAdmin = async () => {
  const result = await getSession();
  
  if(!result.success || !result.session?.user) {
    redirect('/sign-in');
  }
  
  const session = result.session;

  const firstName = session?.user?.name?.split(' ')[0] || null;

  const user = {
    name: session?.user?.name,
    email: session?.user?.email,
    image: session?.user?.image,
  };

  return (
    <>
      <AdminHeader user={user} />
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
        <h1 className="text-6xl font-extrabold tracking-widest">
          WELCOME {firstName ? firstName.toUpperCase() : 'ADMIN'}
        </h1>
      </main>
    </>
  )
}

export default WelcomeAdmin