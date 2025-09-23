import { Navigate } from "react-router-dom";

const Index = () => {
  // Redirect to Home page since this component is not used in the main routing
  return <Navigate to="/" replace />;
};

export default Index;
