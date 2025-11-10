import { Card, CardBody, CardHeader, Col, FormGroup, Input, InputGroup, InputGroupText, Label, Row, Table, Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import Swal from 'sweetalert2'
import Autosuggest from 'react-autosuggest';
import { useContext, useState, useEffect } from "react";
import "./css/Venta.css"
import { UserContext } from "../context/UserProvider";

const modelo = {
    nombre: "",
    correo: "",
    idRolNavigation: {
        idRol: 0,
        descripcion: ""
    }
}

const Venta = () => {
    const { user } = useContext(UserContext)

    const [a_Productos, setA_Productos] = useState([])
    const [a_Busqueda, setA_Busqueda] = useState("")
    const [clientes, setClientes] = useState([])
    const [clienteSeleccionado, setClienteSeleccionado] = useState("")
    const [modalCliente, setModalCliente] = useState(false)
    const [nuevoCliente, setNuevoCliente] = useState({
        nombreCompleto: "",
        correo: "",
        telefono: "",
        direccion: ""
    })

    const [documentoCliente, setDocumentoCliente] = useState("")
    const [nombreCliente, setNombreCliente] = useState("")
    const [tipoDocumento, setTipoDocumento] = useState("Boleta")
    const [productos, setProductos] = useState([])
    const [total, setTotal] = useState(0)
    const [subTotal, setSubTotal] = useState(0)
    const [igv, setIgv] = useState(0)

    useEffect(() => {
        cargarClientes();
    }, [])

    const cargarClientes = async () => {
        try {
            const response = await fetch("/api/cliente")
            if (response.ok) {
                const data = await response.json()
                setClientes(data)
            }
        } catch (error) {
            console.error("Error cargando clientes:", error)
        }
    }

    const agregarCliente = async () => {
        try {
            const response = await fetch("/api/cliente", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nuevoCliente)
            })

            if (response.ok) {
                const result = await response.json()
                Swal.fire('Éxito', 'Cliente agregado correctamente', 'success')
                setNuevoCliente({ nombreCompleto: "", correo: "", telefono: "", direccion: "" })
                setModalCliente(false)
                cargarClientes()
                // Seleccionar el nuevo cliente automáticamente
                setClienteSeleccionado(result.idCliente.toString())
                setNombreCliente(result.nombreCompleto)
            } else {
                Swal.fire('Error', 'No se pudo agregar el cliente', 'error')
            }
        } catch (error) {
            console.error("Error agregando cliente:", error)
            Swal.fire('Error', 'Error de conexión', 'error')
        }
    }

    const handleClienteChange = (e) => {
        const clienteId = e.target.value;
        setClienteSeleccionado(clienteId);

        if (clienteId) {
            const cliente = clientes.find(c => c.idCliente.toString() === clienteId);
            if (cliente) {
                setNombreCliente(cliente.nombreCompleto);
                setDocumentoCliente("");
            }
        } else {
            setNombreCliente("");
            setDocumentoCliente("");
        }
    }

    const reestablecer = () => {
        setClienteSeleccionado("");
        setDocumentoCliente("");
        setNombreCliente("")
        setTipoDocumento("Boleta")
        setProductos([])
        setTotal(0)
        setSubTotal(0)
        setIgv(0)
    }

    //para obtener la lista de sugerencias
    const onSuggestionsFetchRequested = ({ value }) => {
        const api = fetch("api/venta/Productos/" + value)
            .then((response) => {
                return response.ok ? response.json() : Promise.reject(response);
            })
            .then((dataJson) => {
                setA_Productos(dataJson)
            }).catch((error) => {
                console.log("No se pudo obtener datos, mayor detalle: ", error)
            })
    }

    //funcion que nos permite borrar las sugerencias
    const onSuggestionsClearRequested = () => {
        setA_Productos([])
    }

    //devuelve el texto que se mostrara en la caja de texto del autocomplete cuando seleccionas una sugerencia (item)
    const getSuggestionValue = (sugerencia) => {
        return sugerencia.codigo + " - " + sugerencia.marca + " - " + sugerencia.descripcion
    }

    //como se debe mostrar las sugerencias - codigo htmlf
    const renderSuggestion = (sugerencia) => (
        <span>
            {sugerencia.codigo + " - " + sugerencia.marca + " - " + sugerencia.descripcion}
        </span>
    )

    //evento cuando cambie el valor del texto de busqueda
    const onChange = (e, { newValue }) => {
        setA_Busqueda(newValue)
    }

    const inputProps = {
        placeholder: "Buscar producto",
        value: a_Busqueda,
        onChange
    }

    const sugerenciaSeleccionada = (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
        Swal.fire({
            title: suggestion.marca + " - " + suggestion.descripcion,
            text: "Ingrese la cantidad",
            input: 'text',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Volver',
            showLoaderOnConfirm: true,
            preConfirm: (inputValue) => {
                if (isNaN(parseFloat(inputValue))) {
                    setA_Busqueda("")
                    Swal.showValidationMessage(
                        "Debe ingresar un valor númerico"
                    )
                } else {
                    let producto = {
                        idProducto: suggestion.idProducto,
                        descripcion: suggestion.descripcion,
                        cantidad: parseInt(inputValue),
                        precio: suggestion.precio,
                        total: suggestion.precio * parseFloat(inputValue)
                    }
                    let arrayProductos = []
                    arrayProductos.push(...productos)
                    arrayProductos.push(producto)

                    setProductos((anterior) => [...anterior, producto])
                    calcularTotal(arrayProductos)
                }
            },
            allowOutsideClick: () => !Swal.isLoading()

        }).then((result) => {
            if (result.isConfirmed) {
                setA_Busqueda("")
            } else {
                setA_Busqueda("")
            }
        })
    }

    const eliminarProducto = (id) => {
        let listaproductos = productos.filter(p => p.idProducto != id)
        setProductos(listaproductos)
        calcularTotal(listaproductos)
    }

    const calcularTotal = (arrayProductos) => {
        let t = 0;
        let st = 0;
        let imp = 0;

        if (arrayProductos.length > 0) {
            arrayProductos.forEach((p) => {
                t = p.total + t
            })

            st = t / (1.18)
            imp = t - st
        }

        setSubTotal(st.toFixed(2))
        setIgv(imp.toFixed(2))
        setTotal(t.toFixed(2))
    }

    const terminarVenta = () => {
        if (productos.length < 1) {
            Swal.fire(
                'Opps!',
                'No existen productos',
                'error'
            )
            return
        }

        let venta = {
            idCliente: clienteSeleccionado ? parseInt(clienteSeleccionado) : 0,
            documentoCliente: documentoCliente,
            nombreCliente: nombreCliente,
            tipoDocumento: tipoDocumento,
            idUsuario: JSON.parse(user).idUsuario,
            subTotal: parseFloat(subTotal),
            igv: parseFloat(igv),
            total: parseFloat(total),
            listaProductos: productos
        }

        const api = fetch("api/venta/Registrar", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(venta)
        })
            .then((response) => {
                return response.ok ? response.json() : Promise.reject(response);
            })
            .then((dataJson) => {
                reestablecer();
                var data = dataJson;
                Swal.fire(
                    'Venta Creada!',
                    'Numero de venta : ' + data.numeroDocumento,
                    'success'
                )
            }).catch((error) => {
                Swal.fire(
                    'Opps!',
                    'No se pudo crear la venta',
                    'error'
                )
                console.log("No se pudo enviar la venta ", error)
            })
    }

    return (
        <Row>
            <Col sm={8}>
                <Row className="mb-2">
                    <Col sm={12}>
                        <Card>
                            <CardHeader style={{ backgroundColor: '#4e73df', color: "white" }}>
                                Cliente
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    <Col sm={6}>
                                        <FormGroup>
                                            <Label>Seleccionar Cliente</Label>
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    value={clienteSeleccionado}
                                                    onChange={handleClienteChange}
                                                >
                                                    <option value="">Cliente General</option>
                                                    {clientes.map(cliente => (
                                                        <option key={cliente.idCliente} value={cliente.idCliente}>
                                                            {cliente.nombreCompleto} - {cliente.telefono}
                                                        </option>
                                                    ))}
                                                </Input>
                                                <Button
                                                    color="primary"
                                                    onClick={() => setModalCliente(true)}
                                                >
                                                    <i className="fas fa-plus"></i>
                                                </Button>
                                            </InputGroup>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={6}>
                                        <FormGroup>
                                            <Label>Nro Documento (Opcional)</Label>
                                            <Input
                                                bsSize="sm"
                                                value={documentoCliente}
                                                onChange={(e) => setDocumentoCliente(e.target.value)}
                                                disabled={!!clienteSeleccionado}
                                                placeholder={clienteSeleccionado ? "Automático para clientes registrados" : "Ingrese documento"}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={12}>
                                        <FormGroup>
                                            <Label>Nombre Cliente</Label>
                                            <Input
                                                bsSize="sm"
                                                value={nombreCliente}
                                                onChange={(e) => setNombreCliente(e.target.value)}
                                                disabled={!!clienteSeleccionado}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {/* Resto del código de productos se mantiene igual */}
                <Row>
                    <Col sm={12}>
                        <Card>
                            <CardHeader style={{ backgroundColor: '#4e73df', color: "white" }}>
                                Productos
                            </CardHeader>
                            <CardBody>
                                <Row className="mb-2">
                                    <Col sm={12}>
                                        <FormGroup>
                                            <Autosuggest
                                                suggestions={a_Productos}
                                                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                                                onSuggestionsClearRequested={onSuggestionsClearRequested}
                                                getSuggestionValue={getSuggestionValue}
                                                renderSuggestion={renderSuggestion}
                                                inputProps={inputProps}
                                                onSuggestionSelected={sugerenciaSeleccionada}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={12}>
                                        <Table striped size="sm">
                                            <thead>
                                                <tr>
                                                    <th></th>
                                                    <th>Producto</th>
                                                    <th>Cantidad</th>
                                                    <th>Precio</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    (productos.length < 1) ? (
                                                        <tr>
                                                            <td colSpan="5">Sin productos</td>
                                                        </tr>
                                                    ) :
                                                        (
                                                            productos.map((item) => (
                                                                <tr key={item.idProducto}>
                                                                    <td>
                                                                        <Button color="danger" size="sm"
                                                                            onClick={() => eliminarProducto(item.idProducto)}
                                                                        >
                                                                            <i className="fas fa-trash-alt"></i>
                                                                        </Button>
                                                                    </td>
                                                                    <td>{item.descripcion}</td>
                                                                    <td>{item.cantidad}</td>
                                                                    <td>{item.precio}</td>
                                                                    <td>{item.total}</td>
                                                                </tr>
                                                            ))
                                                        )
                                                }
                                            </tbody>
                                        </Table>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Col>

            <Col sm={4}>
                {/* Detalle de venta se mantiene igual */}
                <Row className="mb-2">
                    <Col sm={12}>
                        <Card>
                            <CardHeader style={{ backgroundColor: '#4e73df', color: "white" }}>
                                Detalle
                            </CardHeader>
                            <CardBody>
                                <Row className="mb-2">
                                    <Col sm={12}>
                                        <InputGroup size="sm" >
                                            <InputGroupText>Tipo:</InputGroupText>
                                            <Input type="select" value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)}>
                                                <option value="Boleta">Boleta</option>
                                                <option value="Factura">Factura</option>
                                            </Input>
                                        </InputGroup>
                                    </Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col sm={12}>
                                        <InputGroup size="sm" >
                                            <InputGroupText>Sub Total:</InputGroupText>
                                            <Input disabled value={subTotal} />
                                        </InputGroup>
                                    </Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col sm={12}>
                                        <InputGroup size="sm" >
                                            <InputGroupText>IGV (18%):</InputGroupText>
                                            <Input disabled value={igv} />
                                        </InputGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={12}>
                                        <InputGroup size="sm" >
                                            <InputGroupText>Total:</InputGroupText>
                                            <Input disabled value={total} />
                                        </InputGroup>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        <Card>
                            <CardBody>
                                <Button color="success" block onClick={terminarVenta} >
                                    <i className="fas fa-money-check"></i> Terminar Venta</Button>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Col>

            {/* Modal para nuevo cliente */}
            <Modal isOpen={modalCliente} toggle={() => setModalCliente(!modalCliente)}>
                <ModalHeader toggle={() => setModalCliente(false)}>Nuevo Cliente</ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label>Nombre Completo *</Label>
                        <Input
                            value={nuevoCliente.nombreCompleto}
                            onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombreCompleto: e.target.value })}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Correo</Label>
                        <Input
                            type="email"
                            value={nuevoCliente.correo}
                            onChange={(e) => setNuevoCliente({ ...nuevoCliente, correo: e.target.value })}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Teléfono</Label>
                        <Input
                            value={nuevoCliente.telefono}
                            onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Dirección</Label>
                        <Input
                            value={nuevoCliente.direccion}
                            onChange={(e) => setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })}
                        />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setModalCliente(false)}>Cancelar</Button>
                    <Button color="primary" onClick={agregarCliente}>Guardar Cliente</Button>
                </ModalFooter>
            </Modal>
        </Row>
    )
}

export default Venta;