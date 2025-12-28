import { Button } from "@/components/ui/button";
import Link from "next/link";

const AdminHomePage = () => {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
            <h1 className="text-6xl font-extrabold tracking-widest">XBLADE</h1>

            <div className="mt-8 gap-4 flex">
                <Link href="/sign-in">
                    <Button variant="default">Sign In</Button>
                </Link>
            </div>
        </main>
    );
};

export default AdminHomePage;