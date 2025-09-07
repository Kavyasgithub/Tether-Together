import { useAuth } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router-dom";

import AuthPage from "./pages/AuthPage";
import CallPage from "./pages/CallPage";
import HomePage from "./pages/HomePage";


// Using plain Routes; Sentry routing wrapper is optional and can be added later

const App = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  return (
    <Routes>
      <Route path="/" element={isSignedIn ? <HomePage /> : <Navigate to={"/auth"} replace />} />
      <Route path="/auth" element={!isSignedIn ? <AuthPage /> : <Navigate to={"/"} replace />} />

      <Route
        path="/call/:id"
        element={isSignedIn ? <CallPage /> : <Navigate to={"/auth"} replace />}
      />

      <Route
        path="*"
        element={isSignedIn ? <Navigate to={"/"} replace /> : <Navigate to={"/auth"} replace />}
      />
  </Routes>
  );
};

export default App;

// first version of routing:
// return (
//   <>
//     <SignedIn>
//       <SentryRoutes>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/auth" element={<Navigate to={"/"} replace />} />
//       </SentryRoutes>
//     </SignedIn>

//     <SignedOut>
//       <SentryRoutes>
//         <Route path="/auth" element={<AuthPage />} />
//         <Route path="*" element={<Navigate to={"/auth"} replace />} />
//       </SentryRoutes>
//     </SignedOut>
//   </>
// );
