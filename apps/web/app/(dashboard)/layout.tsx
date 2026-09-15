import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { SplashWrapper } from "@/components/layout/splash-wrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <SplashWrapper>
      <div className="min-h-screen bg-gray-50">
        <Sidebar user={session.user as any} />
        <div className="lg:pl-64">
          <Topbar user={session.user as any} />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SplashWrapper>
  );
}
