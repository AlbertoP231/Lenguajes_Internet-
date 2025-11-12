import { useEffect, useState } from "react";
import DataTable from 'react-data-table-component';
import { Card, CardBody, CardHeader, Button, Modal, ModalHeader, ModalBody, Label, Input, FormGroup, ModalFooter, Row, Col } from "reactstrap"
import Swal from 'sweetalert2'

const modeloUsuario = {
    idUsuario: 0,
    nombre: "",
    correo: "",
    telefono: "",
    idRol: 0,
    clave: "",
    esActivo: true
}

const Usuario = () => {

    const [usuario, setUsuario] = useState(modeloUsuario);
    const [pendiente, setPendiente] = useState(true);
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [verModal, setVerModal] = useState(false);

    const handleChange = (e) => {
        console.log(e.target.value)

        let value;

        if (e.target.name === "idRol") {
            value = parseInt(e.target.value, 10) || 0;
        } else if (e.target.name === "esActivo") {
            value = (e.target.value === "true");
        } else {
            value = e.target.value;
        }

        setUsuario({
            ...usuario,
            [e.target.name]: value
        })
    }

    const obtenerRoles = async () => {
        let response = await fetch("/api/rol/Lista");
        if (response.ok) {
            let data = await response.json()
            setRoles(data)
        }
    }

    const obtenerUsuarios = async () => {
        let response = await fetch("/api/usuario/Lista");

        if (response.ok) {
            let data = await response.json()
            setUsuarios(data)
            setPendiente(false)
        }
    }

    useEffect(() => {
        obtenerRoles();
        obtenerUsuarios();
    }, [])

    const columns = [
        {
            name: 'Nombre',
            selector: row => row.nombre,
            sortable: true,
        },
        {
            name: 'Correo',
            selector: row => row.correo,
            sortable: true,
        },
        {
            name: 'Telefono',
            selector: row => row.telefono,
            sortable: true,
        },
        {
            name: 'Rol',
            selector: row => row.idRolNavigation,
            sortable: true,
            cell: row => (row.idRolNavigation ? row.idRolNavigation.descripcion : '')
        },
        {
            name: 'Estado',
            selector: row => row.esActivo,
            sortable: true,
            cell: row => {
                let clase;
                clase = row.esActivo ? "badge badge-info p-2" : "badge badge-danger p-2"
                return (
                    <span className={clase}>{row.esActivo ? "Activo" : "No Activo"}</span>
                )
            }
        },
        {
            name: '',
            cell: row => (
                <>
                    <Button color="primary" size="sm" className="mr-2"
                        onClick={() => abrirEditarModal(row)}
                    >
                        <i className="fas fa-pen-alt"></i>
                    </Button>

                    <Button color="danger" size="sm"
                        onClick={() => eliminarUsuario(row.idUsuario)}
                    >
                        <i className="fas fa-trash-alt"></i>
                    </Button>
                </>
            ),
        },
    ];

    const customStyles = {
        headCells: {
            style: {
                fontSize: '13px',
                fontWeight: 800,
            },
        },
        headRow: {
            style: {
                backgroundColor: "#eee",
            }
        }
    };

    const paginationComponentOptions = {
        rowsPerPageText: 'Filas por página',
        rangeSeparatorText: 'de',
        selectAllRowsItem: true,
        selectAllRowsItemText: 'Todos',
    };

    const abrirEditarModal = (data) => {
        setUsuario(data);
        setVerModal(true);
    }

    const cerrarModal = () => {
        setUsuario(modeloUsuario)
        setVerModal(false);
    }

    const guardarCambios = async () => {
        // Validaciones básicas
        if (!usuario.nombre || !usuario.correo || !usuario.idRol) {
            Swal.fire('Error', 'Nombre, correo y rol son obligatorios', 'error');
            return;
        }

        // Para NUEVO usuario, usar la API de session/crear
        if (usuario.idUsuario === 0) {
            // Validar contraseña para nuevo usuario
            if (!usuario.clave || usuario.clave.length < 6) {
                Swal.fire('Error', 'La contraseña es obligatoria y debe tener al menos 6 caracteres', 'error');
                return;
            }

            try {
                const response = await fetch("/api/session/crear", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify({
                        nombre: usuario.nombre,
                        correo: usuario.correo,
                        clave: usuario.clave,
                        idRol: usuario.idRol,
                        telefono: usuario.telefono || ""
                    })
                });

                const responseText = await response.text();
                console.log('Respuesta del servidor:', responseText);

                if (response.ok) {
                    Swal.fire('Éxito', 'Usuario creado correctamente', 'success');
                    await obtenerUsuarios();
                    setUsuario(modeloUsuario);
                    setVerModal(false);
                } else {
                    Swal.fire('Error', responseText, 'error');
                }
            } catch (error) {
                console.error('Error de red:', error);
                Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
            }

        } else {
            // Para EDITAR usuario existente, mantener la lógica actual
            const payload = { ...usuario };
            delete payload.idRolNavigation;

            payload.idRol = parseInt(payload.idRol, 10) || 0;
            payload.esActivo = !!payload.esActivo;

            // Si no se cambió la contraseña, enviar string vacío o null
            if (!payload.clave) {
                payload.clave = "";
            }

            try {
                const response = await fetch("/api/usuario/Editar", {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    await obtenerUsuarios();
                    setUsuario(modeloUsuario);
                    setVerModal(false);
                    Swal.fire('Éxito', 'Usuario actualizado correctamente', 'success');
                } else {
                    const text = await response.text();
                    Swal.fire('Error', text || 'Error al actualizar', 'error');
                }
            } catch (error) {
                console.error('Error de red:', error);
                Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
            }
        }
    }

    const eliminarUsuario = async (id) => {
        Swal.fire({
            title: '¿Está seguro?',
            text: "¿Desea eliminar el usuario?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'No, volver'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch("/api/usuario/Eliminar/" + id, { method: "DELETE" })
                    .then(response => {
                        if (response.ok) {
                            obtenerUsuarios();
                            Swal.fire(
                                'Eliminado!',
                                'El usuario fue eliminado.',
                                'success'
                            );
                        } else {
                            response.text().then(t => Swal.fire('Error', t || 'No se pudo eliminar', 'error'));
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
                    });
            }
        });
    }

    return (
        <>
            <Card>
                <CardHeader style={{ backgroundColor: '#4e73df', color: "white" }}>
                    Lista de Usuarios
                </CardHeader>
                <CardBody>
                    <Button color="success" size="sm" onClick={() => { setUsuario(modeloUsuario); setVerModal(true); }}>Nuevo Usuario</Button>
                    <hr></hr>
                    <DataTable
                        columns={columns}
                        data={usuarios}
                        progressPending={pendiente}
                        pagination
                        paginationComponentOptions={paginationComponentOptions}
                        customStyles={customStyles}
                    />
                </CardBody>
            </Card>

            <Modal isOpen={verModal}>
                <ModalHeader>
                    {usuario.idUsuario === 0 ? 'Nuevo Usuario' : 'Editar Usuario'}
                </ModalHeader>
                <ModalBody>
                    <Row>
                        <Col sm={6}>
                            <FormGroup>
                                <Label>Nombre *</Label>
                                <Input bsSize="sm" name="nombre" onChange={handleChange} value={usuario.nombre} required />
                            </FormGroup>
                        </Col>
                        <Col sm={6}>
                            <FormGroup>
                                <Label>Correo *</Label>
                                <Input bsSize="sm" name="correo" onChange={handleChange} value={usuario.correo} type="email" required />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={6}>
                            <FormGroup>
                                <Label>Teléfono</Label>
                                <Input bsSize="sm" name="telefono" onChange={handleChange} value={usuario.telefono} />
                            </FormGroup>
                        </Col>
                        <Col sm={6}>
                            <FormGroup>
                                <Label>Rol *</Label>
                                <Input bsSize="sm" type={"select"} name="idRol" onChange={handleChange} value={usuario.idRol} required>
                                    <option value={0}>Seleccionar</option>
                                    {roles.map((item) => (
                                        <option key={item.idRol} value={item.idRol}>{item.descripcion}</option>
                                    ))}
                                </Input>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="6">
                            <FormGroup>
                                <Label>Contraseña {usuario.idUsuario === 0 && '*'}</Label>
                                <Input
                                    bsSize="sm"
                                    name="clave"
                                    onChange={handleChange}
                                    value={usuario.clave}
                                    type="password"
                                    placeholder={usuario.idUsuario === 0 ? "Mínimo 6 caracteres" : "Dejar vacío para no cambiar"}
                                    required={usuario.idUsuario === 0}
                                />
                            </FormGroup>
                        </Col>
                        <Col sm="6">
                            <FormGroup>
                                <Label>Estado</Label>
                                <Input bsSize="sm" type={"select"} name="esActivo" onChange={handleChange} value={usuario.esActivo}>
                                    <option value={true}>Activo</option>
                                    <option value={false}>Inactivo</option>
                                </Input>
                            </FormGroup>
                        </Col>
                    </Row>
                    <small className="text-muted">* Campos obligatorios</small>
                </ModalBody>
                <ModalFooter>
                    <Button size="sm" color="primary" onClick={guardarCambios}>
                        {usuario.idUsuario === 0 ? 'Crear Usuario' : 'Actualizar'}
                    </Button>
                    <Button size="sm" color="danger" onClick={cerrarModal}>Cancelar</Button>
                </ModalFooter>
            </Modal>
        </>
    )
}

export default Usuario;