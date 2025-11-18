import './App.css';
import {BrowserRouter, Link} from "react-router-dom";
import AppRoutes from "./components/routes/AppRoutes";
import { AuthProvider } from './context/AuthContext';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Link to="/catalog"></Link>

                <AppRoutes/>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
