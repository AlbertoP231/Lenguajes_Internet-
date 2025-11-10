using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactVentas.Models;
using ReactVentas.Models.DTO;
using System.Security.Cryptography;
using System.Text;

namespace ReactVentas.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClienteController : ControllerBase
    {
        private readonly DBREACT_VENTAContext _context;

        public ClienteController(DBREACT_VENTAContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Route("Lista")]
        public async Task<IActionResult> Lista()
        {
            List<DtoCliente> lista = new List<DtoCliente>();
            try
            {
                lista = await _context.Clientes
                    .Where(c => c.esActivo == true)
                    .OrderByDescending(c => c.idCliente)
                    .Select(c => new DtoCliente
                    {
                        idCliente = c.idCliente,
                        nombreCompleto = c.nombreCompleto,
                        correo = c.correo,
                        telefono = c.telefono,
                        direccion = c.direccion,
                        esActivo = c.esActivo,
                        fechaRegistro = c.fechaRegistro
                    })
                    .ToListAsync();

                return StatusCode(StatusCodes.Status200OK, lista);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpPost]
        [Route("Guardar")]
        public async Task<IActionResult> Guardar([FromBody] DtoClienteCreate request)
        {
            try
            {
                // Validaciones
                if (string.IsNullOrEmpty(request.nombreCompleto))
                    return BadRequest("El nombre completo es obligatorio");

                // Verificar si el correo ya existe (si se proporciona)
                if (!string.IsNullOrEmpty(request.correo))
                {
                    var clienteExistente = await _context.Clientes
                        .FirstOrDefaultAsync(c => c.correo.ToLower() == request.correo.ToLower() && c.esActivo == true);

                    if (clienteExistente != null)
                        return BadRequest("El correo ya está registrado");
                }

                var cliente = new Cliente
                {
                    nombreCompleto = request.nombreCompleto,
                    correo = request.correo,
                    telefono = request.telefono,
                    direccion = request.direccion,
                    esActivo = true,
                    fechaRegistro = DateTime.Now
                };

                await _context.Clientes.AddAsync(cliente);
                await _context.SaveChangesAsync();

                var clienteCreado = new DtoCliente
                {
                    idCliente = cliente.idCliente,
                    nombreCompleto = cliente.nombreCompleto,
                    correo = cliente.correo,
                    telefono = cliente.telefono,
                    direccion = cliente.direccion,
                    esActivo = cliente.esActivo,
                    fechaRegistro = cliente.fechaRegistro
                };

                return StatusCode(StatusCodes.Status200OK, new { message = "ok", data = clienteCreado });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpPut]
        [Route("Editar/{id:int}")]
        public async Task<IActionResult> Editar(int id, [FromBody] DtoCliente request)
        {
            try
            {
                var cliente = await _context.Clientes.FindAsync(id);

                if (cliente == null)
                    return StatusCode(StatusCodes.Status404NotFound, new { message = "Cliente no encontrado" });

                // Validar que el correo no esté en uso por otro cliente
                if (!string.IsNullOrEmpty(request.correo))
                {
                    var clienteConMismoCorreo = await _context.Clientes
                        .FirstOrDefaultAsync(c => c.correo.ToLower() == request.correo.ToLower() && c.idCliente != id && c.esActivo == true);

                    if (clienteConMismoCorreo != null)
                        return BadRequest("El correo ya está en uso por otro cliente");
                }

                cliente.nombreCompleto = request.nombreCompleto;
                cliente.correo = request.correo;
                cliente.telefono = request.telefono;
                cliente.direccion = request.direccion;
                cliente.esActivo = request.esActivo;

                _context.Clientes.Update(cliente);
                await _context.SaveChangesAsync();

                return StatusCode(StatusCodes.Status200OK, new { message = "ok" });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpDelete]
        [Route("Eliminar/{id:int}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            try
            {
                var cliente = await _context.Clientes.FindAsync(id);

                if (cliente == null)
                    return StatusCode(StatusCodes.Status404NotFound, new { message = "Cliente no encontrado" });

                cliente.esActivo = false;
                _context.Clientes.Update(cliente);
                await _context.SaveChangesAsync();

                return StatusCode(StatusCodes.Status200OK, new { message = "ok" });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpGet]
        [Route("Obtener/{id:int}")]
        public async Task<IActionResult> Obtener(int id)
        {
            try
            {
                var cliente = await _context.Clientes
                    .Where(c => c.idCliente == id && c.esActivo == true)
                    .Select(c => new DtoCliente
                    {
                        idCliente = c.idCliente,
                        nombreCompleto = c.nombreCompleto,
                        correo = c.correo,
                        telefono = c.telefono,
                        direccion = c.direccion,
                        esActivo = c.esActivo,
                        fechaRegistro = c.fechaRegistro
                    })
                    .FirstOrDefaultAsync();

                if (cliente == null)
                    return StatusCode(StatusCodes.Status404NotFound, new { message = "Cliente no encontrado" });

                return StatusCode(StatusCodes.Status200OK, cliente);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }
    }
}