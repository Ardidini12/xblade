import { Button } from "@/components/ui/button";
import Link from "next/link";

const HomePage = () => {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
            <h1 className="text-6xl font-extrabold tracking-widest">XBLADE</h1>
            <p className="mt-4 text-slate-400">The Ultimate Pro Clubs Platform</p>

            <div className="mt-8 gap-4 flex">
                <Link href="/sign-in">
                    <Button variant="default">Sign In</Button>
                </Link>
                <Link href="/leagues/view">
                    <Button variant="outline">View Leagues</Button>
                </Link>
            </div>
            <div className="mt-8 gap-4 flex">
                <p className="mt-4 text-slate-400"> Don't have an account with us?
                    <Link href="/sign-up"> Sign Up</Link>
                </p>
            </div>
        </main>
    );
};

export default HomePage;