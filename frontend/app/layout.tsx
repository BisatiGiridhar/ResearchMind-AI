import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Multi-Agent AI Research Assistant',
  description: 'Autonomous multi-agent research platform searching, verifying, and synthesizing real-world evidence.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080c14] text-gray-100 min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">{children}</main>
      </body>
    </html>
  );
}
