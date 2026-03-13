import { Outlet } from 'react-router-dom';

export default function HubLayout() {
  return (
    <div className="hub-plate">
      <Outlet />
    </div>
  );
}
