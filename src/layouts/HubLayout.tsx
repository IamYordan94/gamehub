import { Outlet } from 'react-router-dom';

export default function HubLayout() {
  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <Outlet />
    </div>
  );
}
