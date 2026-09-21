import { RouterProvider } from "react-router/dom";
import { AuthProvider } from "./features/auth/context/AuthProvider";
import { router } from "./shared/routes/router";

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
