import Link from "next/link";
import Image from "next/image";

export default function NotFoundPage() {
    return (
        <div className="w-full min-h-dvh flex flex-col items-center justify-center pt-4">
            <div className="fixed bgGradient w-screen h-dvh -z-10"></div>
            <Link
                className="block focus:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-lg"
                href="/"
            >
                Tools Management System
            </Link>
            <div className="w-full h-full flex justify-center items-center">
                <div className="flex flex-col max-w-xl text-center items-center justify-center px-4">
                    <div className="text-3xl font-medium">Page not found</div>
                    <div className="mt-6 ">
                        <Image src={"/not-found.gif"} alt={"Not found"} width={550} height={450}  className={"rounded-lg shadow-lg shadow-gray-500 dark:shadow-white "} loading={"eager"}/>
                    </div>
                    <div className="mt-8">
                        <Link
                            className="focus:outline-none focus-visible:ring-1 focus-visible:ring-ring py-2 px-3 rounded-lg bg-secondary hover:bg-gray-200 dark:hover:bg-gray-700"
                            href="/"
                        >
                            Return to home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
