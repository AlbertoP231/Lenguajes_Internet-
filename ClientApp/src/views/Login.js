import { useContext, useState } from "react"
import { UserContext } from "../context/UserProvider"
import Swal from 'sweetalert2'
import { Navigate } from "react-router-dom"

const Login = () => {

    const [_correo, set_Correo] = useState("")
    const [_clave, set_Clave] = useState("")
    const { user, iniciarSession } = useContext(UserContext)

    // Estados para el registro
    const [activeTab, setActiveTab] = useState("login")
    const [registerData, setRegisterData] = useState({
        nombre: "",
        correo: "",
        clave: "",
        confirmarClave: "",
        idRol: 2
    })

    if (user != null) {
        return <Navigate to="/" />
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        let request = {
            correo: _correo,
            clave: _clave
        }

        try {
            const response = await fetch("api/session/login", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(request)
            });

            if (!response.ok) {
                const text = await response.text();
                Swal.fire('Error', text || 'No se pudo iniciar sesión', 'error');
                return;
            }

            const dataJson = await response.json();

            if (dataJson && dataJson.idUsuario > 0) {
                iniciarSession(dataJson)
            } else {
                Swal.fire('Error', 'No se encontró el usuario', 'error')
            }
        } catch (error) {
            console.error('Error login:', error)
            Swal.fire('Error', 'No se pudo iniciar sesión', 'error')
        }
    }

    // Función para manejar el registro - CORREGIDA
    const handleRegister = async (event) => {
        event.preventDefault()

        // Validaciones
        if (registerData.clave !== registerData.confirmarClave) {
            Swal.fire('Error', 'Las contraseñas no coinciden', 'error')
            return
        }

        if (registerData.clave.length < 6) {
            Swal.fire('Error', 'La contraseña debe tener al menos 6 caracteres', 'error')
            return
        }

        try {
            const response = await fetch("api/session/crear", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    nombre: registerData.nombre,
                    correo: registerData.correo,
                    clave: registerData.clave,
                    idRol: registerData.idRol
                })
            })

            // Manejar respuesta como texto (string)
            const responseText = await response.text()
            console.log('Respuesta del servidor:', responseText)

            if (response.ok) {
                Swal.fire('Éxito', responseText, 'success')
                // Limpiar formulario y cambiar a login
                setRegisterData({
                    nombre: "",
                    correo: "",
                    clave: "",
                    confirmarClave: "",
                    idRol: 2
                })
                setActiveTab("login")
            } else {
                Swal.fire('Error', responseText, 'error')
            }
        } catch (error) {
            console.error('Error de red:', error)
            Swal.fire('Error', 'No se pudo conectar con el servidor', 'error')
        }
    }

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-xl-10 col-lg-12 col-md-9">
                    <div className="card o-hidden border-0 shadow-lg my-5">
                        <div className="card-body p-0">
                            <div className="row">
                                <div className="col-lg-6 d-none d-lg-block bg-login-image"></div>
                                <div className="col-lg-6">
                                    <div className="p-5">
                                        {/* Pestañas Login/Registro */}
                                        <div className="text-center mb-4">
                                            <div className="btn-group btn-group-toggle" data-toggle="buttons">
                                                <label className={`btn btn-outline-primary ${activeTab === "login" ? "active" : ""}`}>
                                                    <input
                                                        type="radio"
                                                        name="options"
                                                        autoComplete="off"
                                                        checked={activeTab === "login"}
                                                        onChange={() => setActiveTab("login")}
                                                    />
                                                    Iniciar Sesión
                                                </label>
                                                <label className={`btn btn-outline-success ${activeTab === "register" ? "active" : ""}`}>
                                                    <input
                                                        type="radio"
                                                        name="options"
                                                        autoComplete="off"
                                                        checked={activeTab === "register"}
                                                        onChange={() => setActiveTab("register")}
                                                    />
                                                    Registrarse
                                                </label>
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <h1 className="h4 text-gray-900 mb-4">
                                                {activeTab === "login" ? "Bienvenido" : "Crear Cuenta"}
                                            </h1>
                                        </div>

                                        {/* Formulario de Login */}
                                        {activeTab === "login" && (
                                            <form className="user" onSubmit={handleSubmit}>
                                                <div className="form-group">
                                                    <input
                                                        type="email"
                                                        className="form-control form-control-user"
                                                        id="loginEmail"
                                                        aria-describedby="emailHelp"
                                                        placeholder="Correo Electrónico"
                                                        value={_correo}
                                                        onChange={(e) => set_Correo(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <input
                                                        type="password"
                                                        className="form-control form-control-user"
                                                        id="loginPassword"
                                                        placeholder="Contraseña"
                                                        value={_clave}
                                                        onChange={(e) => set_Clave(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <button type="submit" className="btn btn-primary btn-user btn-block">
                                                    Ingresar
                                                </button>
                                            </form>
                                        )}

                                        {/* Formulario de Registro */}
                                        {activeTab === "register" && (
                                            <form className="user" onSubmit={handleRegister}>
                                                <div className="form-group">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-user"
                                                        id="registerName"
                                                        placeholder="Nombre Completo"
                                                        value={registerData.nombre}
                                                        onChange={(e) => setRegisterData({ ...registerData, nombre: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <input
                                                        type="email"
                                                        className="form-control form-control-user"
                                                        id="registerEmail"
                                                        placeholder="Correo Electrónico"
                                                        value={registerData.correo}
                                                        onChange={(e) => setRegisterData({ ...registerData, correo: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <input
                                                        type="password"
                                                        className="form-control form-control-user"
                                                        id="registerPassword"
                                                        placeholder="Contraseña (mínimo 6 caracteres)"
                                                        value={registerData.clave}
                                                        onChange={(e) => setRegisterData({ ...registerData, clave: e.target.value })}
                                                        required
                                                        minLength="6"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <input
                                                        type="password"
                                                        className="form-control form-control-user"
                                                        id="registerConfirmPassword"
                                                        placeholder="Confirmar Contraseña"
                                                        value={registerData.confirmarClave}
                                                        onChange={(e) => setRegisterData({ ...registerData, confirmarClave: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="registerRol" className="text-gray-600 small">Rol</label>
                                                    <select
                                                        className="form-control"
                                                        id="registerRol"
                                                        value={registerData.idRol}
                                                        onChange={(e) => setRegisterData({ ...registerData, idRol: parseInt(e.target.value) })}
                                                    >
                                                        <option value="1">Administrador</option>
                                                        <option value="2">Empleado</option>
                                                    </select>
                                                </div>
                                                <button type="submit" className="btn btn-success btn-user btn-block">
                                                    <i className="fas fa-user-plus fa-fw mr-2"></i>
                                                    Crear Cuenta
                                                </button>
                                            </form>
                                        )}

                                        <hr />
                                        <div className="text-center">
                                            <small className="text-muted">
                                                {activeTab === "login"
                                                    ? "¿No tienes una cuenta? "
                                                    : "¿Ya tienes una cuenta? "
                                                }
                                                <button
                                                    type="button"
                                                    className="btn btn-link p-0"
                                                    onClick={() => setActiveTab(activeTab === "login" ? "register" : "login")}
                                                >
                                                    {activeTab === "login" ? "Regístrate aquí" : "Inicia sesión aquí"}
                                                </button>
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login