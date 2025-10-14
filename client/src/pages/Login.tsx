import loginpage from "../assets/loginpage.jpg"
import iitiLogo from "../assets/iitilogo.png"

const Login = () => {
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${loginpage})` }}
    >
      <div className="bg-white/20 backdrop-blur-lg shadow-lg rounded-3xl p-16 text-center max-w-md w-full space-y-8">
        <div className="flex items-center justify-center space-x-4">
          <img src={iitiLogo} alt="IIT Indore" className="h-12 w-12" />
          <h1 className="text-4xl font-extrabold text-white">R&D Portal</h1>
        </div>

        <p className="text-white text-lg">
          Login using your institute email ID
        </p>

        <button
          onClick={() =>
            (window.location.href =
              "http://localhost:5000/api/auth/google/redirect")
          }
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
        >
          Login with Google
        </button>
      </div>
    </div>
  )
}

export default Login
