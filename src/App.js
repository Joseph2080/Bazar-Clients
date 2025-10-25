import './App.css';
import {BrowserRouter, Link} from "react-router-dom";
import AppRoutes from "./components/routes/AppRoutes";

function App() {
    return (
        <BrowserRouter>
            <Link to="/catalog"></Link>

            <AppRoutes/>
        </BrowserRouter>
    );
}

export default App;
