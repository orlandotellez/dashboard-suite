import { Outlet } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";

function App() {
  return (
    <>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </>
  );
}

export default App;
