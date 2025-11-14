// src/components/common/LoadingScreen.jsx
import logo from "../../assets/bazar-logo.gif";

export default function LoadingScreen({ message = "Loading..." }) {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
                <img
                    src={logo}
                    alt="Loading"
                    className="mx-auto"
                />
                <p className="mt-4 text-gray-600">{message}</p>
            </div>
        </div>
    );
}