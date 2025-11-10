import { useContext, useState, useEffect } from "react"
import { UserContext } from "../context/UserProvider"
import Swal from 'sweetalert2'
import { Card, CardBody, CardHeader, Col, Row, Table, Button, Form, FormGroup, Label, Input, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap"

const Cliente = () => {
    const { user } = useContext(UserContext)
    const [clientes, setClientes] = useState([])
    const [modalAbierto, setModalAbierto] = useState(false)
    const [clienteEditando, setClienteEditando] = useState(null)
    const [formData, setFormData] = useState({
        nombreCompleto: "",
        correo: "",
        telefono: "",
        direccion: ""
    })

    useEffect(() => {
        cargarClientes()
    }, [])

    const cargarClientes = async () => {
        try {
            const response = await fetch("/api/cliente/lista")
            if (response.ok) {
                const data = await response.json()
                setClientes(data)
            }
        } catch (error) {
            console.error("Error cargando clientes:", error)
            Swal.fire('Error', 'No se pudieron cargar los clientes', 'error')
        }
    }

    const abrirModal = (cliente = null) => {
        if (cliente) {
            setClienteEditando(cliente)
            setFormData({
                nombreCompleto: cliente.nombreCompleto,
                correo: cliente.correo || "",
                telefono: cliente.telefono || "",
                direccion: cliente.direccion || ""
            })
        } else {
            setClienteEditando(null)
            setFormData({
                nombreCompleto: "",
                correo: "",
                telefono: "",
                direccion: ""
            })
        }
        setModalAbierto(true)
    }

    const cerrarModal = () => {
        setModalAbierto(false)
        setClienteEditando(null)
        setFormData({
            nombreCompleto: "",
            correo: "",
            telefono: "",
            direccion: ""
        })
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const guardarCliente = async () => {
        // Validaciones
        if (!formData.nombreCompleto.trim()) {
            Swal.fire('Error', 'El nombre completo es obligatorio', 'error')
            return
        }

        try {
            let url, method, body

            if (clienteEditando) {
                url = `/api/cliente/editar/${clienteEditando.idCliente}`
                method = 'PUT'
                body = {
                    idCliente: clienteEditando.idCliente,
                    nombreCompleto: formData.nombreCompleto,
                    correo: formData.correo,
                    telefono: formData.telefono,
                    direccion: formData.direccion,
                    esActivo: true,
                    fechaRegistro: clienteEditando.fechaRegistro
                }
            } else {
                url = "/api/cliente/guardar"
                method = 'POST'
                body = {
                    nombreCompleto: formData.nombreCompleto,
                    correo: formData.correo,
                    telefono: formData.telefono,
                    direccion: formData.direccion
                }
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })

            if (response.ok) {
                const result = await response.json()
                Swal.fire('Éxito', clienteEditando ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente', 'success')
                cerrarModal()
                cargarClientes()
            } else {
                const error = await response.json()
                Swal.fire('Error', error.message || 'No se pudo guardar el cliente', 'error')
            }
        } catch (error) {
            console.error("Error guardando cliente:", error)
            Swal.fire('Error', 'Error de conexión', 'error')
        }
    }

    const eliminarCliente = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esta acción",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/cliente/eliminar/${id}`, {
                    method: 'DELETE'
                })

                if (response.ok) {
                    Swal.fire('Eliminado', 'El cliente ha sido eliminado', 'success')
                    cargarClientes()
                } else {
                    const error = await response.json()
                    Swal.fire('Error', error.message || 'No se pudo eliminar el cliente', 'error')
                }
            } catch (error) {
                console.error("Error eliminando cliente:", error)
                Swal.fire('Error', 'Error de conexión', 'error')
            }
        }
    }

    return (
        <div className="container-fluid">
            <Row>
                <Col sm={12}>
                    <Card>
                        <CardHeader style={{ backgroundColor: '#4e73df', color: "white" }}>
                            <Row>
                                <Col sm={6}>
                                    <h5 className="mb-0">Gestión de Clientes</h5>
                                </Col>
                                <Col sm={6} className="text-end">
                                    <Button color="success" size="sm" onClick={() => abrirModal()}>
                                        <i className="fas fa-plus me-2"></i>
                                        Nuevo Cliente
                                    </Button>
                                </Col>
                            </Row>
                        </CardHeader>
                        <CardBody>
                            <Table striped responsive>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre Completo</th>
                                        <th>Correo</th>
                                        <th>Teléfono</th>
                                        <th>Dirección</th>
                                        <th>Fecha Registro</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientes.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center">No hay clientes registrados</td>
                                        </tr>
                                    ) : (
                                        clientes.map(cliente => (
                                            <tr key={cliente.idCliente}>
                                                <td>{cliente.idCliente}</td>
                                                <td>{cliente.nombreCompleto}</td>
                                                <td>{cliente.correo || '-'}</td>
                                                <td>{cliente.telefono || '-'}</td>
                                                <td>{cliente.direccion || '-'}</td>
                                                <td>{new Date(cliente.fechaRegistro).toLocaleDateString()}</td>
                                                <td>
                                                    <Button
                                                        color="primary"
                                                        size="sm"
                                                        className="me-1"
                                                        onClick={() => abrirModal(cliente)}
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </Button>
                                                    <Button
                                                        color="danger"
                                                        size="sm"
                                                        onClick={() => eliminarCliente(cliente.idCliente)}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Modal para crear/editar cliente */}
            <Modal isOpen={modalAbierto} toggle={cerrarModal}>
                <ModalHeader toggle={cerrarModal}>
                    {clienteEditando ? 'Editar Cliente' : 'Nuevo Cliente'}
                </ModalHeader>
                <ModalBody>
                    <Form>
                        <FormGroup>
                            <Label for="nombreCompleto">Nombre Completo *</Label>
                            <Input
                                type="text"
                                id="nombreCompleto"
                                name="nombreCompleto"
                                value={formData.nombreCompleto}
                                onChange={handleInputChange}
                                placeholder="Ingrese nombre completo"
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="correo">Correo Electrónico</Label>
                            <Input
                                type="email"
                                id="correo"
                                name="correo"
                                value={formData.correo}
                                onChange={handleInputChange}
                                placeholder="Ingrese correo electrónico"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="telefono">Teléfono</Label>
                            <Input
                                type="text"
                                id="telefono"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleInputChange}
                                placeholder="Ingrese teléfono"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="direccion">Dirección</Label>
                            <Input
                                type="text"
                                id="direccion"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleInputChange}
                                placeholder="Ingrese dirección"
                            />
                        </FormGroup>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={cerrarModal}>
                        Cancelar
                    </Button>
                    <Button color="primary" onClick={guardarCliente}>
                        {clienteEditando ? 'Actualizar' : 'Guardar'}
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}

export default Cliente