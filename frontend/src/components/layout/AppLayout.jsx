// AppLayout wraps authenticated page content
// pages handle their own AppShell (sidebar + navbar) so this just passes children through
// not sure if the naming difference matters but keeping both around
export default function AppLayout({ children }) {
  return <>{children}</>
}
