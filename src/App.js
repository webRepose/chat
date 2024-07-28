import { BrowserRouter } from "react-router-dom";
import AppRouter from "./components/AppRouter";
import Navbar from "./components/Navbar";
import Preloader from "./components/Preloaders/Preloader";
import { useAuthState } from "react-firebase-hooks/auth";
import { useContext } from "react";
import Context from "./index";

const App = () => {
  const { auth } = useContext(Context);
  const [user, loading, error] = useAuthState(auth);

  if (error && user) {
    console.log("костыль");
  }

  if (loading) {
    return <Preloader />;
  }

  return (
    <BrowserRouter>
      <Navbar />
      <AppRouter />
    </BrowserRouter>
  );
};

export default App;
