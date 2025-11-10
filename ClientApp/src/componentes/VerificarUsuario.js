import { useContext } from "react"
import { UserContext } from "../context/UserProvider"
import { Navigate } from "react-router-dom"

const VerificarUsuario = ({ children, rolesPermitidos = [] }) => {
    const { user } = useContext(UserContext)

    if (user == null) {
        return <Navigate to="/Login" />
    }

    // Parsear el usuario
    const userData = JSON.parse(user);

    // Si no se especifican roles permitidos, permitir a todos los usuarios autenticados
    if (rolesPermitidos.length === 0) {
        return children;
    }

    // Verificar si el usuario tiene uno de los roles permitidos
    if (rolesPermitidos.includes(userData.idRolNavigation.descripcion)) {
        return children;
    } else {
        // Si no tiene permisos, redirigir al inicio
        return <Navigate to="/" />
    }
}

export default VerificarUsuario