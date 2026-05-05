// components/layout/AppShell.jsx
import PropTypes from "prop-types";

import { Navbar } from "./Navbar.jsx";
import { Sidebar } from "./Sidebar.jsx";

export function AppShell({ title, breadcrumbs = [], pendingCount = 0, children }) {
  return (
    <div className="min-h-screen bg-vpms-bg text-vpms-text">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar title={title} breadcrumbs={breadcrumbs} pendingCount={pendingCount} />
          <main className="flex-1 px-4 py-5">{children}</main>
        </div>
      </div>
    </div>
  );
}

AppShell.propTypes = {
  title: PropTypes.string.isRequired,
  breadcrumbs: PropTypes.arrayOf(PropTypes.string),
  pendingCount: PropTypes.number,
  children: PropTypes.node.isRequired,
};
